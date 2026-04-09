import os
import requests
import sqlite3
import random

BASE_URL = "http://localhost/api"

students = []
teachers = []

print("Registering 20 Students...")
for i in range(1, 21):
    user = {
        "username": f"student_{i}",
        "email": f"student{i}@example.com",
        "password": "password123",
        "role": "student"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=user)
    if res.status_code == 201:
        students.append(user)
    elif res.status_code == 400:
        students.append(user) # Might already exist
        print(f"User {user['username']} may already exist.")

print("Registering 10 Teachers...")
for i in range(1, 11):
    user = {
        "username": f"teacher_{i}",
        "email": f"teacher{i}@example.com",
        "password": "password123",
        "role": "instructor"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=user)
    if res.status_code == 201:
        teachers.append((res.json()['id'], user))
    elif res.status_code == 400:
        # If exists, we need to login to get the ID
        login_res = requests.post(f"{BASE_URL}/auth/login", json={"username": user["username"], "password": user["password"]})
        if login_res.status_code == 200:
             teachers.append((login_res.json()['user_id'], user))

teacher_ids = [t[0] for t in teachers]

print("Injecting Domains and Specializations into Course Service DB...")

course_db_path = "/Users/test/Desktop/projetAOS/elearning_platform/course_service/db.sqlite3"
conn = sqlite3.connect(course_db_path)
cur = conn.cursor()

domains = [
    ("Computer Science", ["AI & Machine Learning", "Web Development", "Cybersecurity", "Data Science"]),
    ("Business", ["Finance", "Marketing", "Management", "Entrepreneurship"]),
    ("Arts", ["Digital Design", "Music Theory", "Photography", "Creative Writing"]),
    ("Engineering", ["Electrical", "Mechanical", "Civil", "Aerospace"]),
    ("Healthcare", ["Anatomy", "Nursing", "Public Health", "Nutrition"]),
    ("Languages", ["Spanish", "French", "Mandarin", "German"])
]

specs_list = []

for d_name, specs in domains:
    cur.execute("INSERT OR IGNORE INTO course_app_domain (name) VALUES (?)", (d_name,))
    cur.execute("SELECT id FROM course_app_domain WHERE name=?", (d_name,))
    domain_id = cur.fetchone()[0]
    
    for s_name in specs:
        cur.execute("INSERT OR IGNORE INTO course_app_specialization (name, domain_id) VALUES (?, ?)", (s_name, domain_id))
        cur.execute("SELECT id FROM course_app_specialization WHERE name=? AND domain_id=?", (s_name, domain_id))
        specs_list.append(cur.fetchone()[0])

# Map teachers to specializations
for tid in teacher_ids:
    selected_specs = random.sample(specs_list, 3)
    for sid in selected_specs:
        cur.execute("INSERT OR IGNORE INTO course_app_instructorspecialization (instructor_id, specialization_id) VALUES (?, ?)", (tid, sid))
        
conn.commit()
conn.close()

print("Using API to create courses for teachers...")

course_titles = ["Introduction to {spec}", "Advanced {spec}", "Mastering {spec}", "{spec} Fundamentals", "Applied {spec}"]

created_courses = 0
for tid, user in teachers:
    # Login teacher
    res = requests.post(f"{BASE_URL}/auth/login", json={"username": user['username'], "password": user['password']})
    if res.status_code != 200:
        continue
    token = res.json()['access']
    
    # Get teacher's allowed specs
    res = requests.get(f"{BASE_URL}/courses/expertise/", headers={"Authorization": f"Bearer {token}"})
    if res.status_code == 200:
        allowed_specs = res.json()
        
        for spec in allowed_specs:
            spec_id = spec['id']
            spec_name = spec['name']
            
            # create 2 courses for each spec
            for title_template in random.sample(course_titles, 2):
                course_data = {
                    "title": title_template.format(spec=spec_name),
                    "description": f"Detailed and interactive curriculum focusing on {spec_name}. Perfect for students exploring new avenues or professionals upgrading skills.",
                    "specialization": spec_id
                }
                c_res = requests.post(f"{BASE_URL}/courses/", json=course_data, headers={"Authorization": f"Bearer {token}"})
                if c_res.status_code == 201:
                    created_courses += 1

print("="*40)
print("Seeding Complete!")
print(f"Created/Verified {len(students)} Students.")
print(f"Created/Verified {len(teachers)} Teachers.")
print(f"Created {len(domains)} Domains and {sum([len(s) for d, s in domains])} Specializations.")
print(f"Generated {created_courses} new dynamic courses in the catalog.")
print("="*40)

with open("/Users/test/Desktop/projetAOS/elearning_platform/accounts.txt", "w") as f:
    f.write("Platform Mock Accounts\n")
    f.write("="*40 + "\n")
    f.write("Admin:\n- admin / admin123\n\n")
    f.write(f"Students (Password for all: password123):\n")
    for s in students:
        f.write(f"- {s['username']} ({s['email']})\n")
    
    f.write(f"\nTeachers (Password for all: password123):\n")
    for tid, t in teachers:
        f.write(f"- {t['username']} ({t['email']})\n")

print("Accounts saved to accounts.txt")
