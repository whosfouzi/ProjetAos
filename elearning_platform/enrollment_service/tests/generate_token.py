import jwt

payload = {
    'user_id': 1,
    'role': 'student',
    'email': 'student@test.com'
}

token = jwt.encode(payload, 'secret', algorithm='HS256')
print("=" * 50)
print("VOTRE TOKEN JWT :")
print("=" * 50)
print(token)
print("=" * 50)
print("\nCopiez ce token et utilisez-le dans Postman.")