import jwt
import os
from rest_framework import authentication, exceptions


class JWTAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return None

            token = parts[1]
            secret = os.environ.get('SECRET_KEY', 'django-insecure-test-key-shared-1234567890')
            payload = jwt.decode(token, secret, algorithms=['HS256'])

            user_id = payload.get('user_id')
            role = payload.get('role', 'student')

            if not user_id:
                raise exceptions.AuthenticationFailed('Invalid token')

            user = type('User', (), {
                'id': user_id,
                'role': role,
                'is_authenticated': True
            })()

            return (user, token)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

    def authenticate_header(self, request):
        return 'Bearer'