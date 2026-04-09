import jwt

# Token pour professeur (peut créer des quiz)
payload_teacher = {
    'user_id': 1,
    'role': 'teacher',
    'email': 'teacher@test.com'
}

# Token pour étudiant (peut passer des quiz)
payload_student = {
    'user_id': 2,
    'role': 'student',
    'email': 'student@test.com'
}

token_teacher = jwt.encode(payload_teacher, 'secret', algorithm='HS256')
token_student = jwt.encode(payload_student, 'secret', algorithm='HS256')

print("=" * 50)
print("TOKEN PROFESSEUR (pour créer des quiz):")
print("=" * 50)
print(token_teacher)
print("\n" + "=" * 50)
print("TOKEN ETUDIANT (pour passer des quiz):")
print("=" * 50)
print(token_student)