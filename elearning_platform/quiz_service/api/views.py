from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction

import logging
from .models import Quiz, Question, Choice, ShortAnswer, QuizAttempt, Answer
from .serializers import (
    QuizSerializer, QuestionSerializer, ChoiceSerializer,
    QuizAttemptSerializer, SubmitAnswerSerializer
)

logger = logging.getLogger(__name__)


class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Quiz.objects.filter(is_active=True)
        if user.role == 'instructor':
            queryset = Quiz.objects.filter(created_by=user.id)
            
        chapter_id = self.request.query_params.get('chapter_id')
        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.id)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit all quiz answers at once (Academic UI compatibility)"""
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can submit assessments'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        quiz = self.get_object()
        user_answers = request.data.get('answers', {})
        
        # Check attempts
        completed_attempts = QuizAttempt.objects.filter(
            quiz=quiz, student_id=request.user.id, completed_at__isnull=False
        ).count()
        
        if completed_attempts >= 2:
            return Response(
                {'error': 'Maximum attempts reached (2/2)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the latest open attempt or create one
        attempt = QuizAttempt.objects.filter(
            quiz=quiz,
            student_id=request.user.id,
            completed_at__isnull=True
        ).order_by('-started_at').first()
        
        if not attempt:
            # If no open attempt, we create one but it should've been created via 'start'
            # For compatibility with legacy 'submit', we create one here
            from django.db.models import Max
            last_attempt = QuizAttempt.objects.filter(quiz=quiz, student_id=request.user.id).aggregate(Max('attempt_number'))
            attempt_num = (last_attempt['attempt_number__max'] or 0) + 1
            
            attempt = QuizAttempt.objects.create(
                quiz=quiz,
                student_id=request.user.id,
                attempt_number=attempt_num
            )
            # Intelligent Pool Selection: Prioritize questions NOT seen in previous attempts
            import random
            all_questions_pool = list(quiz.questions.all().values_list('id', flat=True))
            
            # Find questions seen in previous attempts
            seen_question_ids = Answer.objects.filter(
                attempt__quiz=quiz,
                attempt__student_id=request.user.id
            ).values_list('question_id', flat=True).distinct()
            
            # Filter pool to unseen questions
            unseen_pool = [qid for qid in all_questions_pool if qid not in seen_question_ids]
            
            if len(unseen_pool) >= quiz.questions_per_attempt:
                # We have enough fresh questions!
                selected_ids = random.sample(unseen_pool, quiz.questions_per_attempt)
            else:
                # Pool is exhausted or too small - combine unseen with some seen ones to fill the set
                random.shuffle(all_questions_pool)
                combined = list(unseen_pool) + [qid for qid in all_questions_pool if qid not in unseen_pool]
                selected_ids = combined[:quiz.questions_per_attempt]
                random.shuffle(selected_ids) # Final shuffle
                
            attempt.selected_questions = selected_ids
            attempt.save()

        # Clear previous answers on this specific attempt
        attempt.answers.all().delete()
        
        total_points = 0
        correct_count = 0
        
        # Use only selected questions for this attempt
        selected_question_ids = attempt.selected_questions or []
        questions = Question.objects.filter(id__in=selected_question_ids)
        
        for question in questions:
            answer_val = user_answers.get(str(question.id))
            is_correct = False
            points_earned = 0
            
            if question.question_type in ['MCQ', 'TRUE_FALSE']:
                if answer_val:
                    try:
                        choice = Choice.objects.get(id=answer_val, question=question)
                        is_correct = choice.is_correct
                        if is_correct:
                            points_earned = question.points
                            correct_count += 1
                    except Choice.DoesNotExist:
                        pass
            
            Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_choice_id=answer_val if isinstance(answer_val, int) else None,
                text_answer=str(answer_val) if not isinstance(answer_val, int) else "",
                is_correct=is_correct,
                points_earned=points_earned
            )
            total_points += points_earned
            
        max_points = sum(q.points for q in questions)
        percentage = int((total_points / max_points * 100)) if max_points > 0 else 0
        
        attempt.score = total_points
        attempt.percentage = percentage
        attempt.completed_at = timezone.now()
        attempt.save()
        
        # Trigger RabbitMQ event only on pass
        if percentage >= quiz.passing_score:
            try:
                from .producer import publish_quiz_passed
                publish_quiz_passed(request.user.id, quiz.course_id, quiz.chapter_id, percentage, len(selected_question_ids))
            except Exception as e:
                print(f"Error publishing: {e}")
            
        logger.info(f"Student {request.user.id} submitted Quiz {quiz.id} (Attempt #{attempt.attempt_number}, Score: {percentage}%)")

        return Response({
            'quiz_id': quiz.id,
            'attempt_number': attempt.attempt_number,
            'score': percentage,
            'correct_answers': correct_count,
            'total_questions': len(selected_question_ids),
            'passed': percentage >= quiz.passing_score,
            'remaining_attempts': 2 - (completed_attempts + 1)
        })

    @action(detail=True, methods=['get'], url_path='my-attempt')
    def my_attempt(self, request, pk=None):
        """Fetch the current student's attempt for this specific quiz"""
        quiz = self.get_object()
        attempt = QuizAttempt.objects.filter(quiz=quiz, student_id=request.user.id).first()
        if not attempt:
            return Response({'detail': 'No attempt found.'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            return Question.objects.filter(quiz_id=quiz_id)
        return Question.objects.all()


class QuizAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = QuizAttemptSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return QuizAttempt.objects.filter(student_id=self.request.user.id)

    @action(detail=False, methods=['post'])
    def start(self, request):
        """Démarrer un quiz"""
        quiz_id = request.data.get('quiz_id')
        
        try:
            quiz = Quiz.objects.get(id=quiz_id, is_active=True)
        except Quiz.DoesNotExist:
            return Response(
                {'error': 'Quiz not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier le nombre de tentatives terminées
        completed_attempts_count = QuizAttempt.objects.filter(
            quiz=quiz,
            student_id=request.user.id,
            completed_at__isnull=False
        ).count()
        
        if completed_attempts_count >= 2:
            return Response(
                {'error': 'Maximum attempts reached (2/2). Final status recorded.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Block if already passed
        if QuizAttempt.objects.filter(quiz=quiz, student_id=request.user.id, percentage__gte=quiz.passing_score).exists():
            return Response(
                {'error': 'Assessment already validated. Mastery achieved.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier si déjà en cours
        existing = QuizAttempt.objects.filter(
            quiz=quiz,
            student_id=request.user.id,
            completed_at__isnull=True
        ).first()
        
        if existing:
            return Response(
                {'attempt_id': existing.id, 'message': 'Quiz already in progress'},
                status=status.HTTP_200_OK
            )

        # Créer une nouvelle tentative
        from django.db.models import Max
        last_attempt = QuizAttempt.objects.filter(quiz=quiz, student_id=request.user.id).aggregate(Max('attempt_number'))
        next_attempt_num = (last_attempt['attempt_number__max'] or 0) + 1
        
        # Intelligent Pool Selection: Prioritize questions NOT seen in previous attempts
        import random
        all_questions_pool = list(quiz.questions.all().values_list('id', flat=True))
        
        # Find questions seen in previous attempts
        seen_question_ids = Answer.objects.filter(
            attempt__quiz=quiz,
            attempt__student_id=request.user.id
        ).values_list('question_id', flat=True).distinct()
        
        # Filter pool to unseen questions
        unseen_pool = [qid for qid in all_questions_pool if qid not in seen_question_ids]
        
        if len(unseen_pool) >= quiz.questions_per_attempt:
            # We have enough fresh questions!
            selected_ids = random.sample(unseen_pool, quiz.questions_per_attempt)
        else:
            # Pool is exhausted or too small - combine unseen with some seen ones to fill the set
            # Ensure the combination is also shuffled
            random.shuffle(all_questions_pool)
            combined = list(unseen_pool) + [qid for qid in all_questions_pool if qid not in unseen_pool]
            selected_ids = combined[:quiz.questions_per_attempt]
            random.shuffle(selected_ids) # Final shuffle

        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student_id=request.user.id,
            attempt_number=next_attempt_num,
            selected_questions=selected_ids
        )

        return Response({
            'attempt_id': attempt.id,
            'attempt_number': attempt.attempt_number,
            'remaining_attempts': 2 - next_attempt_num,
            'quiz': QuizSerializer(quiz, context={'attempt': attempt}).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """Soumettre une réponse pour une question"""
        attempt = self.get_object()
        
        if attempt.completed_at:
            return Response(
                {'error': 'Quiz already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SubmitAnswerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        question_id = serializer.validated_data['question_id']
        choice_id = serializer.validated_data.get('choice_id')
        text_answer = serializer.validated_data.get('text_answer', '')

        try:
            question = Question.objects.get(id=question_id, quiz=attempt.quiz)
        except Question.DoesNotExist:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier si déjà répondu
        existing = Answer.objects.filter(attempt=attempt, question=question).first()
        if existing:
            return Response(
                {'error': 'Already answered this question'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Corriger la réponse
        is_correct = False
        points_earned = 0

        if question.question_type == 'MCQ':
            if choice_id:
                try:
                    choice = Choice.objects.get(id=choice_id, question=question)
                    is_correct = choice.is_correct
                    if is_correct:
                        points_earned = question.points
                except Choice.DoesNotExist:
                    return Response(
                        {'error': 'Invalid choice'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        elif question.question_type == 'TRUE_FALSE':
            if choice_id:
                try:
                    choice = Choice.objects.get(id=choice_id, question=question)
                    is_correct = choice.is_correct
                    if is_correct:
                        points_earned = question.points
                except Choice.DoesNotExist:
                    return Response(
                        {'error': 'Invalid choice'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        elif question.question_type == 'SHORT':
            # Vérifier si la réponse correspond à une réponse correcte
            correct_answers = question.correct_answers.values_list('answer_text', flat=True)
            is_correct = text_answer.strip().lower() in [a.strip().lower() for a in correct_answers]
            if is_correct:
                points_earned = question.points

        Answer.objects.create(
            attempt=attempt,
            question=question,
            selected_choice_id=choice_id,
            text_answer=text_answer,
            is_correct=is_correct,
            points_earned=points_earned
        )

        return Response({
            'success': True,
            'is_correct': is_correct,
            'points_earned': points_earned
        })

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Terminer le quiz et calculer le score"""
        attempt = self.get_object()
        
        if attempt.completed_at:
            return Response(
                {'error': 'Quiz already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        answers = attempt.answers.all()
        total_points = sum(a.points_earned for a in answers)
        max_points = sum(q.points for q in attempt.quiz.questions.all())
        
        percentage = int((total_points / max_points * 100)) if max_points > 0 else 0
        
        attempt.score = total_points
        attempt.percentage = percentage
        attempt.completed_at = timezone.now()
        attempt.save()

        passed = percentage >= attempt.quiz.passing_score
        
        if passed:
            try:
                from .producer import publish_quiz_passed
                total_quizzes = Quiz.objects.filter(course_id=attempt.quiz.course_id).count()
                publish_quiz_passed(request.user.id, attempt.quiz.course_id, percentage, total_quizzes)
            except Exception as e:
                print(f"Error publishing quiz_passed: {e}")

        return Response({
            'attempt_id': attempt.id,
            'score': total_points,
            'max_score': max_points,
            'percentage': percentage,
            'passed': passed
        })

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Obtenir les résultats détaillés du quiz"""
        attempt = self.get_object()
        
        answers_data = []
        for answer in attempt.answers.all():
            answers_data.append({
                'question_id': answer.question.id,
                'question_text': answer.question.text,
                'question_type': answer.question.question_type,
                'points': answer.question.points,
                'points_earned': answer.points_earned,
                'is_correct': answer.is_correct,
                'user_answer': answer.text_answer if answer.text_answer else (
                    answer.selected_choice.text if answer.selected_choice else None
                )
            })

        return Response({
            'attempt_id': attempt.id,
            'quiz_title': attempt.quiz.title,
            'started_at': attempt.started_at,
            'completed_at': attempt.completed_at,
            'score': attempt.score,
            'percentage': attempt.percentage,
            'passed': attempt.percentage >= attempt.quiz.passing_score,
            'answers': answers_data
        })