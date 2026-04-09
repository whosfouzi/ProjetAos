import os
import django

# Set up Django environment for Course Service
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'course_project.settings')
django.setup()

from course_app.models import Domain, Specialization, InstructorSpecialization, Course

def seed():
    print("Seeding academic domains and specializations...")
    
    # 1. Create Domains
    cs, _ = Domain.objects.get_or_create(name="Computer Science")
    phys, _ = Domain.objects.get_or_create(name="Physics")
    math, _ = Domain.objects.get_or_create(name="Mathematics")
    business, _ = Domain.objects.get_or_create(name="Business")
    ling, _ = Domain.objects.get_or_create(name="Linguistics")
    
    # 2. Create Specializations
    web, _ = Specialization.objects.get_or_create(domain=cs, name="Web Development")
    dist, _ = Specialization.objects.get_or_create(domain=cs, name="Distributed Systems")
    se, _ = Specialization.objects.get_or_create(domain=cs, name="Software Engineering")
    ai, _ = Specialization.objects.get_or_create(domain=cs, name="Artificial Intelligence")
    
    quantum, _ = Specialization.objects.get_or_create(domain=phys, name="Quantum Mechanics")
    relativity, _ = Specialization.objects.get_or_create(domain=phys, name="Relativity")
    
    accounting, _ = Specialization.objects.get_or_create(domain=business, name="Accounting")
    
    # 3. Link Instructor (ID 1) to expertises
    # For testing, let's give instructor 1 multiple expertises
    InstructorSpecialization.objects.get_or_create(instructor_id=1, specialization=web)
    InstructorSpecialization.objects.get_or_create(instructor_id=1, specialization=dist)
    InstructorSpecialization.objects.get_or_create(instructor_id=1, specialization=quantum)
    InstructorSpecialization.objects.get_or_create(instructor_id=1, specialization=accounting)
    InstructorSpecialization.objects.get_or_create(instructor_id=1, specialization=se)

    # 4. Map Existing Courses
    mapping = {
        'Introduction to Quantum Physics': quantum,
        'Modern Web Development with React': web,
        'Financial Accounting for Beginners': accounting,
        'Distributed Systems 101': dist,
        'Intro To Java': se,
        'HTML, CSS Basics': web
    }
    
    for title, spec in mapping.items():
        Course.objects.filter(title=title).update(specialization=spec)
    
    print("Success! Data correctly mapped and instructor expertises assigned.")

if __name__ == "__main__":
    seed()
