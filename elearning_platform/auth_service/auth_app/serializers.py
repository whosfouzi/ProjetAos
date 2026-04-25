from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'profile_picture', 'bio', 'last_login', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True},
            'last_login': {'read_only': True},
            'date_joined': {'read_only': True}
        }
        
    def get_profile_picture(self, obj):
        if not obj.profile_picture:
            return None
        # Return a relative path that works with our Vite proxy
        # Since MEDIA_URL is /api/auth/media/, we want /api/auth/media/profile_pics/xyz.jpg
        return f"/api/auth/media/{obj.profile_picture.name}"

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=make_password(validated_data['password']),
            role=validated_data.get('role', 'student')
        )
        return user
