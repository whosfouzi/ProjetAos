import jwt

# Token pour professeur
payload_teacher = {
    'user_id': 1,
    'role': 'teacher',
    'email': 'teacher@test.com'
}

# Token pour etudiant
payload_student = {
    'user_id': 2,
    'role': 'student',
    'email': 'student@test.com'
}

token_teacher = jwt.encode(payload_teacher, 'secret', algorithm='HS256')
token_student = jwt.encode(payload_student, 'secret', algorithm='HS256')

print("=" * 60)
print("TOKEN PROFESSEUR (pour creer des quiz):")
print("=" * 60)
print(token_teacher)
print()
print("=" * 60)
print("TOKEN ETUDIANT (pour passer des quiz):")
print("=" * 60)
print(token_student)