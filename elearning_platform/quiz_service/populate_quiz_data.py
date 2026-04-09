import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_service.settings')
django.setup()

from api.models import Quiz, Question, Choice

print("Clearing existing mock quizzes...")
Quiz.objects.all().delete()

print("Generating quizzes dynamically for chapters...")

# To correctly align quizzes with the course system, we'll pretend the course IDs range from 1 to 6
# And chapter IDs range from 1 to 18 (since we just created 3 chapters for 6 courses)
# But it's safer to just fetch from the DB or just loop dynamically based on assumption.
# In the database, the chapters were created sequentially. Course 1 -> Chapters 1,2,3. Course 2 -> Chapters 4,5,6...

course_chapter_map = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
    5: [13, 14, 15],
    6: [16, 17, 18],
}

instructor_id = 1

for course_id, chapters in course_chapter_map.items():
    for chapter_id in chapters:
        # Create 1 main assessment per chapter
        quiz = Quiz.objects.create(
            title=f"Assessment for Module {chapter_id % 3 if chapter_id % 3 != 0 else 3}",
            description=f"Evaluate your understanding of the materials in Chapter {chapter_id}.",
            course_id=course_id,
            chapter_id=chapter_id,
            created_by=instructor_id,
            duration_minutes=15,
            passing_score=50
        )
        
        # Add a couple of questions
        q1 = Question.objects.create(quiz=quiz, text="Which of the following is correct?", question_type="MCQ", points=1, order=1)
        Choice.objects.create(question=q1, text="The material strictly prohibits this.", is_correct=False)
        Choice.objects.create(question=q1, text="This is the correct foundational concept.", is_correct=True)
        Choice.objects.create(question=q1, text="None of the above.", is_correct=False)

        q2 = Question.objects.create(quiz=quiz, text="True or False: The concepts introduced here are mandatory for the next module.", question_type="TRUE_FALSE", points=1, order=2)
        Choice.objects.create(question=q2, text="True", is_correct=True)
        Choice.objects.create(question=q2, text="False", is_correct=False)

        # In some chapters, maybe add a secondary "Practice Quiz"
        if chapter_id % 2 == 0:
            practice_quiz = Quiz.objects.create(
                title="Practice Knowledge Check",
                description="A quick ungraded review.",
                course_id=course_id,
                chapter_id=chapter_id,
                created_by=instructor_id,
                duration_minutes=5,
                passing_score=100
            )
            pq1 = Question.objects.create(quiz=practice_quiz, text="Are you confident in proceeding?", question_type="TRUE_FALSE", points=0, order=1)
            Choice.objects.create(question=pq1, text="Yes", is_correct=True)
            Choice.objects.create(question=pq1, text="No", is_correct=False)

print(f"Quizzes fully populated! Total: {Quiz.objects.count()}")
