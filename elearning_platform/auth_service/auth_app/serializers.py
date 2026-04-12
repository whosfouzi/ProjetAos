from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'profile_picture', 'bio', 'last_login', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True},
            'last_login': {'read_only': True},
            'date_joined': {'read_only': True}
        }
        
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=make_password(validated_data['password']),
            role=validated_data.get('role', 'student')
        )
        return user
