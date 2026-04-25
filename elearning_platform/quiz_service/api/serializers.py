from rest_framework import serializers
from .models import Quiz, Question, Choice, ShortAnswer, QuizAttempt, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = Choice
        fields = ['id', 'text'] # Hide is_correct from students!


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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Shuffle choices for each attempt
        # We can use the attempt ID from context to seed for consistency during the same attempt
        # but the requirement says "on each attempt... shuffle". 
        # For simplicity and freshness, we shuffle here.
        import random
        # To keep it consistent during the same attempt session, we could seed with (attempt_id + question_id)
        attempt = self.context.get('attempt')
        if attempt:
            seed = attempt.id + instance.id
            random.seed(seed)
            random.shuffle(representation['choices'])
            random.seed(None) # Reset seed
        else:
            random.shuffle(representation['choices'])
            
        return representation
        
    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        question = Question.objects.create(**validated_data)
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
        return question


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

    def to_representation(self, instance):
        # Filter questions if an attempt is provided in the context
        attempt = self.context.get('attempt')
        if attempt and attempt.selected_questions:
            # We need to preserve the order of questions if desired, but for now just filter
            all_questions = instance.questions.filter(id__in=attempt.selected_questions)
            # Serialize them with the attempt in context for choice shuffling
            questions_data = QuestionSerializer(all_questions, many=True, context=self.context).data
            
            # Update the representation
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
        fields = ['id', 'quiz', 'student_id', 'started_at', 'completed_at', 'score', 'percentage', 'answers']


class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True)