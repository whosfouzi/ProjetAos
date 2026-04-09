import os
import django

# Set up Django environment for Quiz Service
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_service.settings')
django.setup()

from api.models import Quiz, Question, Choice

def reseed():
    print("Clearing existing Quizzes and Attempts...")
    Quiz.objects.all().delete()
    
    # Mapping Chapters 12 through 29
    # Each course has 3 chapters
    # Course 1: 12, 13, 14
    # Course 2: 15, 16, 17
    # Course 3: 18, 19, 20
    # Course 4: 21, 22, 23
    # Course 5: 24, 25, 26
    # Course 6: 27, 28, 29
    
    course_chapter_map = {
        1: [12, 13, 14],
        2: [15, 16, 17],
        3: [18, 19, 20],
        4: [21, 22, 23],
        5: [24, 25, 26],
        6: [27, 28, 29]
    }
    
    for course_id, chapter_ids in course_chapter_map.items():
        for i, ch_id in enumerate(chapter_ids):
            q_title = f"Assessment for Chapter {ch_id} (Module {i+1})"
            print(f"Creating Quiz for Chapter {ch_id} in Course {course_id}...")
            
            quiz = Quiz.objects.create(
                title=q_title,
                course_id=course_id,
                chapter_id=ch_id,
                passing_score=60,
                is_active=True,
                created_by=1 # assuming id 1 is instructor/admin
            )
            
            # Add 3 Sample Questions per Quiz
            for j in range(1, 4):
                question = Question.objects.create(
                    quiz=quiz,
                    text=f"Question {j}: What is the core concept of this lesson?",
                    question_type='MCQ',
                    points=10
                )
                
                # Choices
                Choice.objects.create(question=question, text="Option A (Correct)", is_correct=True)
                Choice.objects.create(question=question, text="Option B (Incorrect)", is_correct=False)
                Choice.objects.create(question=question, text="Option C (Incorrect)", is_correct=False)
                Choice.objects.create(question=question, text="Option D (Incorrect)", is_correct=False)

    print("Success! Quizzes mapped to Chapters 12-29.")

if __name__ == "__main__":
    reseed()
