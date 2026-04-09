import jwt

payload = {
    'user_id': 1,
    'role': 'student',
    'email': 'student@test.com'
}

token = jwt.encode(payload, 'secret', algorithm='HS256')
print(f"Token: {token}")