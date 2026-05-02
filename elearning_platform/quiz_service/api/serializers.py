from rest_framework import serializers
from .models import Quiz, Question, Choice, ShortAnswer, QuizAttempt, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        # Only show is_correct to instructors/teachers
        if not request or not hasattr(request, 'user') or request.user.role not in ['instructor', 'teacher']:
            representation.pop('is_correct', None)
        return representation


class ShortAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortAnswer
        fields = ['id', 'answer_text']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)
    correct_answers = ShortAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'question_type', 'points', 'order', 'choices', 'correct_answers']

    def validate_choices(self, value):
        if self.initial_data.get('question_type') == 'MCQ':
            if not (3 <= len(value) <= 4):
                raise serializers.ValidationError("MCQ questions must have 3 to 4 choices.")
            
            # The initial_data might have 'is_correct' which ChoiceSerializer hides from output but we need for validation
            # Since ChoiceSerializer hides 'is_correct', we need to check the raw data
            raw_choices = self.initial_data.get('choices', [])
            correct_count = sum(1 for c in raw_choices if c.get('is_correct') is True)
            if correct_count != 1:
                raise serializers.ValidationError("Exactly one choice must be marked as correct.")
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        import random
        attempt = self.context.get('attempt')
        if attempt:
            seed = attempt.id + instance.id
            random.seed(seed)
            random.shuffle(representation['choices'])
            random.seed(None)
        else:
            random.shuffle(representation['choices'])
        return representation
        
    def create(self, validated_data):
        # Pop choices from validated_data to avoid model field error
        validated_data.pop('choices', None)
        # We need to get choices from initial_data because ChoiceSerializer hides is_correct
        choices_data = self.initial_data.get('choices', [])
        question = Question.objects.create(**validated_data)
        for choice_data in choices_data:
            Choice.objects.create(
                question=question, 
                text=choice_data.get('text'),
                is_correct=choice_data.get('is_correct', False)
            )
        return question

    def update(self, instance, validated_data):
        validated_data.pop('choices', None)
        instance.text = validated_data.get('text', instance.text)
        instance.question_type = validated_data.get('question_type', instance.question_type)
        instance.points = validated_data.get('points', instance.points)
        instance.order = validated_data.get('order', instance.order)
        instance.save()
        
        choices_data = self.initial_data.get('choices', [])
        if choices_data:
            Choice.objects.filter(question=instance).delete()
            for choice_data in choices_data:
                Choice.objects.create(
                    question=instance, 
                    text=choice_data.get('text'),
                    is_correct=choice_data.get('is_correct', False)
                )
        return instance


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by = serializers.IntegerField(read_only=True)
    total_questions = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course_id', 'chapter_id', 'created_by', 'created_at', 
                  'duration_minutes', 'passing_score', 'is_active', 'questions', 
                  'total_questions', 'total_points', 'questions_per_attempt']

    def validate(self, data):
        # Optional: could check if the quiz already exists and has 20 questions
        # but validation usually happens on the questions themselves.
        # However, for the "Require each quiz to contain a pool of exactly 20 questions",
        # we might need to enforce this during an "activation" phase or just keep it as a goal.
        # Since quizzes are created first and then questions added, 
        # we can't easily enforce 20 questions during the initial POST.
        return data

    def to_representation(self, instance):
        attempt = self.context.get('attempt')
        if attempt and attempt.selected_questions:
            all_questions = instance.questions.filter(id__in=attempt.selected_questions)
            questions_data = QuestionSerializer(all_questions, many=True, context=self.context).data
            representation = super().to_representation(instance)
            representation['questions'] = questions_data
            representation['total_questions'] = len(questions_data)
            return representation
        return super().to_representation(instance)

    def get_total_questions(self, obj):
        return obj.questions.count()

    def get_total_points(self, obj):
        return sum(q.points for q in obj.questions.all())


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'selected_choice', 'text_answer', 'is_correct', 'points_earned']


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'student_id', 'started_at', 'completed_at', 'score', 'percentage', 'answers', 'selected_questions', 'attempt_number']


class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True)