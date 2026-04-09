from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User

class StatelessJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = User(id=validated_token.get('user_id'), username=f"user_{validated_token.get('user_id')}")
        user.is_active = True
        # Attach role from JWT payload so views can check it
        user.role = validated_token.get('role', 'student')
        return user
