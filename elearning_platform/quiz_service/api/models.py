from django.db import models
from django.utils import timezone


class Quiz(models.Model):
    """Quiz créé par un professeur"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course_id = models.IntegerField()
    chapter_id = models.IntegerField(null=True, blank=True)  # Link to a specific chapter
    created_by = models.IntegerField()  # user_id du professeur
    created_at = models.DateTimeField(default=timezone.now)
    duration_minutes = models.IntegerField(default=30)
    passing_score = models.IntegerField(default=70)  # pourcentage
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['course_id']),
            models.Index(fields=['created_by']),
        ]

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPES = [
        ('MCQ', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False'),
        ('SHORT', 'Short Answer'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.quiz.title} - {self.text[:50]}"


class Choice(models.Model):
    """Options pour les questions QCM"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class ShortAnswer(models.Model):
    """Réponses correctes pour les questions à réponse courte"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='correct_answers')
    answer_text = models.CharField(max_length=500)

    def __str__(self):
        return self.answer_text


class QuizAttempt(models.Model):
    """Tentative d'un étudiant à un quiz"""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student_id = models.IntegerField()
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)  # points obtenus
    percentage = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ['quiz', 'student_id']
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['quiz', 'student_id']),
        ]

    def __str__(self):
        return f"Student {self.student_id} - {self.quiz.title}"


class Answer(models.Model):
    """Réponse d'un étudiant à une question"""
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, on_delete=models.CASCADE, null=True, blank=True)
    text_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)

    def __str__(self):
        return f"Answer for {self.question}"