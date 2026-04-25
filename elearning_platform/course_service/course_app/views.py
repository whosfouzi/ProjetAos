import logging
import os
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from .models import Course, Chapter, Domain, Specialization, InstructorSpecialization
from .serializers import CourseSerializer, ChapterSerializer, DomainSerializer, SpecializationSerializer
from course_project.auth_backends import StatelessJWTAuthentication

logging.basicConfig(level=logging.INFO, format='[COURSE-SERVICE] [%(asctime)s] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class CoursePagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    authentication_classes = [StatelessJWTAuthentication]
    pagination_class = CoursePagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Course.objects.all().order_by('-id')

        # Restrict instructors/teachers to ONLY see their own courses.
        if self.request.user.is_authenticated and self.request.user.role in ['instructor', 'teacher']:
            queryset = queryset.filter(instructor_id=self.request.user.id)

        if self.request.query_params.get('my_courses') == 'true' and self.request.user.is_authenticated:
            if self.request.user.role in ['instructor', 'teacher']:
                queryset = queryset.filter(instructor_id=self.request.user.id)

        domain_id = self.request.query_params.get('domain_id')
        specialization_id = self.request.query_params.get('specialization_id')
        search = self.request.query_params.get('search')

        if domain_id:
            queryset = queryset.filter(specialization__domain_id=domain_id)
        if specialization_id:
            queryset = queryset.filter(specialization_id=specialization_id)
        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.role not in ['instructor', 'teacher']:
            return Response({"detail": "Only instructors can create courses."}, status=status.HTTP_403_FORBIDDEN)

        specialization_id = request.data.get('specialization')
        if not specialization_id:
            return Response({"detail": "Specialization is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate that the instructor is authorized for this specialization
        is_authorized = InstructorSpecialization.objects.filter(
            instructor_id=request.user.id, 
            specialization_id=specialization_id
        ).exists()
        
        if not is_authorized:
             return Response({"detail": "You do not have the required specialization to create this course."}, status=status.HTTP_403_FORBIDDEN)

        mutable_data = request.data.copy()
        mutable_data['instructor_id'] = request.user.id

        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class InstructorExpertiseView(generics.ListAPIView):
    """Returns the list of specializations allowed for the logged-in instructor."""
    serializer_class = SpecializationSerializer
    authentication_classes = [StatelessJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        instructor_id = self.request.user.id
        specialization_ids = InstructorSpecialization.objects.filter(instructor_id=instructor_id).values_list('specialization_id', flat=True)
        return Specialization.objects.filter(id__in=specialization_ids)


class DomainListView(generics.ListAPIView):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    authentication_classes = [StatelessJWTAuthentication]

class SpecializationListView(generics.ListAPIView):
    serializer_class = SpecializationSerializer
    authentication_classes = [StatelessJWTAuthentication]

    def get_queryset(self):
        queryset = Specialization.objects.all()
        domain_id = self.request.query_params.get('domain_id')
        if domain_id:
            queryset = queryset.filter(domain_id=domain_id)
        return queryset


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    authentication_classes = [StatelessJWTAuthentication]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role not in ['instructor', 'teacher'] or instance.instructor_id != request.user.id:
            return Response({"detail": "You do not have permission to delete this course."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)





class ChapterListView(generics.ListCreateAPIView):
    """List and create chapters for a specific course."""
    serializer_class = ChapterSerializer
    authentication_classes = [StatelessJWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Chapter.objects.filter(course_id=self.kwargs['pk'])

    def create(self, request, *args, **kwargs):
        course = Course.objects.get(pk=self.kwargs['pk'])
        if request.user.role not in ['instructor', 'teacher'] or course.instructor_id != request.user.id:
            return Response({"detail": "You can only add chapters to your own courses."}, status=status.HTTP_403_FORBIDDEN)

        mutable_data = request.data.copy()
        mutable_data['course'] = course.id
        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChapterDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific chapter."""
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    authentication_classes = [StatelessJWTAuthentication]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def _check_ownership(self, request, instance):
        if request.user.role not in ['instructor', 'teacher'] or instance.course.instructor_id != request.user.id:
            return Response({"detail": "You do not have permission to modify this chapter."}, status=status.HTTP_403_FORBIDDEN)
        return None

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        err = self._check_ownership(request, instance)
        if err:
            return err
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        err = self._check_ownership(request, instance)
        if err:
            return err
        # Also delete the physical PDF file
        if instance.pdf_file:
            from django.conf import settings
            file_path = os.path.join(settings.MEDIA_ROOT, instance.pdf_file.name)
            if os.path.isfile(file_path):
                os.remove(file_path)
        return super().destroy(request, *args, **kwargs)


class ChapterPDFDeleteView(generics.GenericAPIView):
    """Delete only the PDF from a chapter without deleting the chapter itself."""
    queryset = Chapter.objects.all()
    authentication_classes = [StatelessJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role not in ['instructor', 'teacher'] or instance.course.instructor_id != request.user.id:
            return Response({"detail": "You do not have permission."}, status=status.HTTP_403_FORBIDDEN)

        if instance.pdf_file:
            from django.conf import settings
            file_path = os.path.join(settings.MEDIA_ROOT, instance.pdf_file.name)
            if os.path.isfile(file_path):
                os.remove(file_path)
            instance.pdf_file = None
            instance.save()
            return Response({"detail": "Chapter PDF deleted."}, status=status.HTTP_200_OK)
        return Response({"detail": "No PDF for this chapter."}, status=status.HTTP_400_BAD_REQUEST)

class AdminStatsView(APIView):
    """Returns high-level course statistics for the dashboard."""
    authentication_classes = [StatelessJWTAuthentication]

    def get(self, request):
        if not getattr(request.user, 'role', None) == 'admin':
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"total_courses": Course.objects.count()})
