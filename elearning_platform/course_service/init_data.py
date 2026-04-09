import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'course_project.settings')
django.setup()

from course_app.models import Course, Lesson

# Create Course
course, created = Course.objects.get_or_create(
    title="Advanced Microservices Architecture",
    description="Learn to build, deploy, and scale resilient microservices using Django, RabbitMQ, and Traefik."
)

# Create Lessons
Lesson.objects.get_or_create(course=course, title="1. Introduction to Event-Driven Systems", content="Content for intro...", order=1)
Lesson.objects.get_or_create(course=course, title="2. Implementing RabbitMQ Workers", content="Content for rabbitmq...", order=2)
Lesson.objects.get_or_create(course=course, title="3. Service Discovery with Consul", content="Content for consul...", order=3)

print(f"Created Course: {course.title} with {course.lessons.count()} lessons.")
