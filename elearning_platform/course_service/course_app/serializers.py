from rest_framework import serializers
from .models import Course, Chapter, Domain, Specialization, InstructorSpecialization


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation.get('pdf_file'):
            if representation['pdf_file'].startswith('http'):
                from urllib.parse import urlparse
                representation['pdf_file'] = urlparse(representation['pdf_file']).path
        return representation


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'

class SpecializationSerializer(serializers.ModelSerializer):
    domain_name = serializers.ReadOnlyField(source='domain.name')
    class Meta:
        model = Specialization
        fields = ['id', 'name', 'domain', 'domain_name']

class CourseSerializer(serializers.ModelSerializer):
    domain = serializers.ReadOnlyField(source='domain_name')
    category = serializers.ReadOnlyField(source='category_name')
    chapters = ChapterSerializer(many=True, read_only=True)
    valid_chapter_ids = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor_id', 'specialization', 'domain', 'category', 'chapters', 'valid_chapter_ids']

    def get_valid_chapter_ids(self, obj):
        return list(obj.chapters.all().values_list('id', flat=True))
