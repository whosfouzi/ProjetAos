import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_service.settings')
django.setup()

from api.models import Quiz, Question, Choice

# Create Quiz
quiz, created = Quiz.objects.get_or_create(
    title="Final Assessment: Microservices",
    course_id=1,
    created_by=1,
    passing_score=60,
    is_active=True
)

# Create 1 MCQ Question
q1, _ = Question.objects.get_or_create(quiz=quiz, text="Which tool is used for Service Discovery?", question_type='MCQ', points=100)
Choice.objects.get_or_create(question=q1, text="Consul", is_correct=True)
Choice.objects.get_or_create(question=q1, text="Nginx", is_correct=False)
Choice.objects.get_or_create(question=q1, text="SQLite", is_correct=False)

print(f"Created Quiz: {quiz.title} (Course ID: {quiz.course_id})")
