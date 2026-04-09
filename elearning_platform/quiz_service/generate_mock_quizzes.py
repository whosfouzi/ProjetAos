import os
import django
import sys
import requests

# Set up django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_service.settings')
django.setup()

from api.models import Quiz, Question, Choice

def fetch_courses_and_chapters():
    # Make raw request to course_service or use django test client if we assume microservices are bridged
    # Wait, getting courses from the course microservice would be a bit hard without auth. 
    # Let me just check what's in the Quiz database first. The quickest way is to just create 
    # some dummy test quizzes for course_ids 1, 2, 3 and chapter_ids 1, 2, 3.
    pass

print("Generating mock quizzes...")
# Let's clean up existing quizzes to avoid duplicates if rerun
Quiz.objects.all().delete()

# We will create 2 quizzes for course_id=1, chapter_id=1
quiz1 = Quiz.objects.create(
    title="Computer Basics Quiz",
    description="Test your knowledge of computer basics.",
    course_id=1,
    chapter_id=1,
    created_by=2, # Instructor ID
    duration_minutes=30,
    passing_score=50
)
q1 = Question.objects.create(quiz=quiz1, text="What does CPU stand for?", question_type="MCQ", points=1, order=1)
Choice.objects.create(question=q1, text="Central Process Unit", is_correct=False)
Choice.objects.create(question=q1, text="Central Processing Unit", is_correct=True)

q2 = Question.objects.create(quiz=quiz1, text="RAM is volatile memory.", question_type="TRUE_FALSE", points=1, order=2)
Choice.objects.create(question=q2, text="True", is_correct=True)
Choice.objects.create(question=q2, text="False", is_correct=False)

quiz2 = Quiz.objects.create(
    title="Advanced Architecture Quiz",
    description="A more difficult quiz.",
    course_id=1,
    chapter_id=1,
    created_by=2,
    duration_minutes=45,
    passing_score=75
)
q3 = Question.objects.create(quiz=quiz2, text="What is a register?", question_type="MCQ", points=2, order=1)
Choice.objects.create(question=q3, text="Tiny memory inside CPU", is_correct=True)
Choice.objects.create(question=q3, text="Main memory", is_correct=False)

# Course 2 (Physics) Chapter 1
quiz3 = Quiz.objects.create(
    title="Physics Basics",
    description="Fundamentals of movement.",
    course_id=2,
    chapter_id=2, # Assuming chapter 2 belongs to course 2
    created_by=2,
    duration_minutes=20,
    passing_score=50
)
q4 = Question.objects.create(quiz=quiz3, text="Gravity is a force.", question_type="TRUE_FALSE", points=1, order=1)
Choice.objects.create(question=q4, text="True", is_correct=True)
Choice.objects.create(question=q4, text="False", is_correct=False)

print(f"Created {Quiz.objects.count()} mock quizzes!")
