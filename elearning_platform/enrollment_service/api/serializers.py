from rest_framework import serializers
from .models import Enrollment, Progress


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student_id', 'course_id', 'enrolled_at', 'status']
        read_only_fields = ['id', 'enrolled_at']


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = ['id', 'enrollment', 'chapter_id', 'viewed', 'quiz_passed', 'completed', 'completed_at', 'viewed_at']
        read_only_fields = ['id', 'completed_at', 'viewed_at']