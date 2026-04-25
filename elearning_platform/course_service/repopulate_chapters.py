import os
import django
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'course_project.settings')
django.setup()

from course_app.models import Course, Chapter

print("Wiping existing chapters for a clean refill...")
Chapter.objects.all().delete()

courses = Course.objects.all()
if not courses:
    print("No courses found. Please create courses via UI or another script first.")
    exit()

academic_modules = [
    {
        "title": "Conceptual Foundations",
        "desc": "An in-depth exploration of the core principles and theoretical frameworks that define this domain."
    },
    {
        "title": "Applied Methodology",
        "desc": "Transitioning from theory to practice with hands-on techniques and real-world implementation strategies."
    },
    {
        "title": "Advanced Synthetics",
        "desc": "Mastering complex architectures and emerging trends within the modern digital ecosystem."
    }
]

print(f"Refilling {courses.count()} courses with academic content...")

for course in courses:
    print(f"Processing: {course.title}")
    
    for i, module in enumerate(academic_modules, 1):
        chapter = Chapter.objects.create(
            course=course,
            title=f"{course.title}: {module['title']}",
            description=module['desc'],
            order=i
        )
        
        # Attach a mock PDF file
        pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Study Guide: " + chapter.title.encode('utf-8') + b") Tj\nET\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
        chapter.pdf_file.save(f"module_{i}_course_{course.id}.pdf", ContentFile(pdf_content), save=True)

print("Course chapters successfully refilled!")
