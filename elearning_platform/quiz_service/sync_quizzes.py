import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_service.settings')
django.setup()

from api.models import Quiz, Question, Choice

COURSE_SERVICE_URL = "http://course-service:8002"

print("Wiping existing quizzes for a clean refill...")
Quiz.objects.all().delete()

try:
    all_courses = []
    url = f"{COURSE_SERVICE_URL}/api/courses/"
    
    while url:
        res = requests.get(url)
        if not res.ok:
            print(f"Failed to fetch from {url}")
            break
        data = res.json()
        results = data.get('results', data)
        if isinstance(results, list):
            all_courses.extend(results)
        
        url = data.get('next') # Move to next page if it exists
        if url and not url.startswith('http'):
            url = f"{COURSE_SERVICE_URL}{url}"

    print(f"Syncing quizzes for {len(all_courses)} courses...")
    
    for course in all_courses:
        course_id = course['id']
        course_title = course['title']
        print(f"  Processing Quizzes for: {course_title}")
        
        # Fetch chapters for this course
        chapters_res = requests.get(f"{COURSE_SERVICE_URL}/api/courses/{course_id}/chapters/")
        if not chapters_res.ok:
            print(f"    Failed to fetch chapters for course {course_id}")
            continue
            
        chapters = chapters_res.json()
        
        for chapter in chapters:
            chapter_id = chapter['id']
            chapter_title = chapter['title']
            
            # Create Quiz with 20-question pool and 10-question challenge
            quiz = Quiz.objects.create(
                title=f"Assessment: {chapter_title}",
                course_id=course_id,
                chapter_id=chapter_id,
                passing_score=70,
                questions_per_attempt=10,
                is_active=True,
                created_by=1 # System Admin
            )
            
            # Create 20 contextual questions for the pool
            for i in range(1, 21):
                question = Question.objects.create(
                    quiz=quiz,
                    text=f"Challenge {i}: Analyze the core principles of {chapter_title}.",
                    points=10,
                    question_type='MCQ'
                )
                
                # Create choices
                Choice.objects.create(question=question, text=f"Advanced {chapter_title} Solution {i}", is_correct=True)
                Choice.objects.create(question=question, text=f"Standard implementation {i}", is_correct=False)
                Choice.objects.create(question=question, text=f"Generic conceptual model {i}", is_correct=False)
                Choice.objects.create(question=question, text=f"Alternative approach {i}", is_correct=False)

    print("Quiz library successfully refilled with 20-question pools (10 per attempt)!")

except Exception as e:
    print(f"Error during synchronization: {e}")
