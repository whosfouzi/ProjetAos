import requests
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone

import requests
import logging
from .models import Enrollment, Progress
from .serializers import EnrollmentSerializer, ProgressSerializer

from rest_framework.views import APIView
from enrollment_service.auth_backends import StatelessJWTAuthentication

logger = logging.getLogger(__name__)

class AdminStatsView(APIView):
    """Returns high-level enrollment statistics for the dashboard."""
    authentication_classes = [StatelessJWTAuthentication]

    def get(self, request):
        if not getattr(request.user, 'role', None) == 'admin':
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
        
        unique_students = Enrollment.objects.values('student_id').distinct().count()
        
        # Get counts per course
        from django.db.models import Count
        course_data = Enrollment.objects.values('course_id').annotate(student_count=Count('student_id', distinct=True)).order_by('-student_count')
        
        # Resolve titles from Course Service
        auth_token = request.headers.get('Authorization', '')
        course_stats = []
        try:
            courses_res = requests.get(f"{settings.COURSE_SERVICE_URL}/api/courses/", headers={'Authorization': auth_token}, timeout=2)
            if courses_res.status_code == 200:
                courses_map = {c['id']: c['title'] for c in courses_res.json()}
                for item in course_data:
                    course_stats.append({
                        "course_id": item['course_id'],
                        "title": courses_map.get(item['course_id'], f"Course {item['course_id']}"),
                        "count": item['student_count']
                    })
        except Exception as e:
            logger.error(f"Failed to resolve course titles for stats: {e}")
            for item in course_data:
                course_stats.append({
                    "course_id": item['course_id'],
                    "title": f"Course {item['course_id']}",
                    "count": item['student_count']
                })

        return Response({
            "total_enrollments": unique_students,
            "course_stats": course_stats
        })

class AdminEnrollmentListView(APIView):
    """Returns a full list of enrollments enriched with student and course metadata."""
    authentication_classes = [StatelessJWTAuthentication]

    def get(self, request):
        if not getattr(request.user, 'role', None) == 'admin':
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
        
        enrollments = Enrollment.objects.all().order_by('-enrolled_at')
        
        # Bulk resolve metadata to avoid N+1 internal service calls
        auth_token = request.headers.get('Authorization', '')
        
        users_map = {}
        courses_map = {}
        
        try:
            # Fetch users from Auth Service
            users_res = requests.get(f"{settings.AUTH_SERVICE_URL if hasattr(settings, 'AUTH_SERVICE_URL') else 'http://auth-service:8001'}/api/auth/admin/users", headers={'Authorization': auth_token}, timeout=2)
            if users_res.status_code == 200:
                for u in users_res.json():
                    users_map[u['id']] = u
            
            # Fetch courses from Course Service
            courses_res = requests.get(f"{settings.COURSE_SERVICE_URL}/api/courses/", headers={'Authorization': auth_token}, timeout=2)
            if courses_res.status_code == 200:
                for c in courses_res.json():
                    courses_map[c['id']] = c
        except Exception as e:
            logger.error(f"Failed to resolve metadata for admin enrollment list: {e}")

        data = []
        for enroll in enrollments:
            user_info = users_map.get(enroll.student_id)
            if not user_info:
                # This is an orphan record (student deleted but enrollment remains)
                continue
                
            course_info = courses_map.get(enroll.course_id, {"title": f"Course {enroll.course_id}"})
            
            # Calculate progress
            progress_items = Progress.objects.filter(enrollment=enroll)
            total = progress_items.count()
            completed = progress_items.filter(completed=True).count()
            percentage = round((completed / total * 100), 1) if total > 0 else 0
            
            data.append({
                "id": enroll.id,
                "student_id": enroll.student_id,
                "student_name": user_info.get('username'),
                "student_email": user_info.get('email'),
                "course_id": enroll.course_id,
                "course_title": course_info.get('title'),
                "status": enroll.status,
                "enrolled_at": enroll.enrolled_at,
                "progress_percentage": percentage,
                "completed_at": enroll.completed_at
            })
            
        return Response(data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student_id=user.id)
        return Enrollment.objects.none()

    def create(self, request):
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can enroll in courses'},
                status=status.HTTP_403_FORBIDDEN
            )

        student_id = request.user.id
        course_id = request.data.get('course_id')

        if not course_id:
            return Response({'error': 'course_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.get(
                f"{settings.COURSE_SERVICE_URL}/api/courses/{course_id}/",
                headers={'Authorization': request.headers.get('Authorization', '')},
                timeout=5
            )
            if response.status_code != 200:
                return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        except requests.exceptions.RequestException:
            return Response({'error': 'Course service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if Enrollment.objects.filter(student_id=student_id, course_id=course_id).exists():
            return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)

        enrollment = Enrollment.objects.create(student_id=student_id, course_id=course_id)

        # Create progress entries for each chapter
        try:
            chapters_response = requests.get(
                f"{settings.COURSE_SERVICE_URL}/api/courses/{course_id}/chapters/",
                headers={'Authorization': request.headers.get('Authorization', '')},
                timeout=5
            )
            if chapters_response.status_code == 200:
                chapters = chapters_response.json()
                for chapter in chapters:
                    Progress.objects.create(
                        enrollment=enrollment,
                        chapter_id=chapter['id'],
                        viewed=False,
                        quiz_passed=False,
                        completed=False
                    )
        except Exception:
            pass

        serializer = self.get_serializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        enrollment = self.get_object()
        progress = Progress.objects.filter(enrollment=enrollment)

        total_chapters = progress.count()
        completed_chapters = progress.filter(completed=True).count()
        percentage = (completed_chapters / total_chapters * 100) if total_chapters > 0 else 0

        return Response({
            'enrollment_id': enrollment.id,
            'course_id': enrollment.course_id,
            'total_chapters': total_chapters,
            'completed_chapters': completed_chapters,
            'completion_percentage': round(percentage, 2),
            'progress': ProgressSerializer(progress, many=True).data
        })

    @action(detail=False, methods=['get'], url_path='course/(?P<course_id>[^/.]+)/roster')
    def roster(self, request, course_id=None):
        if request.user.role != 'instructor':
            return Response({'error': 'Only instructors can view course rosters'}, status=status.HTTP_403_FORBIDDEN)

        enrollments = Enrollment.objects.filter(course_id=course_id)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        enrollments = self.get_queryset()

        courses_data = []
        for enrollment in enrollments:
            try:
                response = requests.get(
                    f"{settings.COURSE_SERVICE_URL}/api/courses/{enrollment.course_id}/",
                    headers={'Authorization': request.headers.get('Authorization', '')},
                    timeout=5
                )
                if response.status_code == 200:
                    course = response.json()
                    course['enrollment_id'] = enrollment.id
                    course['enrolled_at'] = enrollment.enrolled_at

                    progress = Progress.objects.filter(enrollment=enrollment)
                    completed = progress.filter(completed=True).count()
                    total = progress.count()
                    course['progress_percentage'] = round((completed / total * 100), 2) if total > 0 else 0

                    courses_data.append(course)
            except Exception:
                courses_data.append({
                    'id': enrollment.course_id,
                    'title': f"Course {enrollment.course_id}",
                    'enrollment_id': enrollment.id,
                    'enrolled_at': enrollment.enrolled_at,
                    'progress_percentage': 0
                })

        return Response(courses_data)


class ProgressViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(enrollment__student_id=self.request.user.id)

    @action(detail=False, methods=['post'])
    def mark_viewed(self, request):
        """Mark a chapter as viewed by the student."""
        enrollment_id = request.data.get('enrollment_id')
        chapter_id = request.data.get('chapter_id')

        # Synchronous check to Quiz Service to ensure reliable progression tracking
        has_quiz = False
        try:
            # We filter by chapter_id specifically
            quiz_check_url = f"{settings.QUIZ_SERVICE_URL}/api/quizzes/?chapter_id={chapter_id}"
            quiz_res = requests.get(
                quiz_check_url, 
                headers={'Authorization': request.headers.get('Authorization', '')},
                timeout=2
            )
            if quiz_res.status_code == 200:
                quizzes = quiz_res.json()
                has_quiz = len(quizzes) > 0
        except Exception as e:
            logger.error(f"Quiz check failed for chapter {chapter_id}: {e}")
            has_quiz = True # Fail-safe: assume quiz exists

        if not enrollment_id or not chapter_id:
            return Response({'error': 'enrollment_id and chapter_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enrollment = Enrollment.objects.get(id=enrollment_id, student_id=request.user.id)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)

        progress, created = Progress.objects.get_or_create(
            enrollment=enrollment,
            chapter_id=chapter_id,
            defaults={'viewed': False, 'quiz_passed': False, 'completed': False}
        )

        progress.viewed = True
        progress.viewed_at = timezone.now()

        # If there's no quiz, mark as passed automatically so chapter completes
        if not has_quiz:
            progress.quiz_passed = True

        progress._recalculate_completion()
        progress.save()
        
        logger.info(f"Student {request.user.id} viewed chapter {chapter_id}. (Quiz exists: {has_quiz})")

        # Recalculate overall course progress
        all_progress = Progress.objects.filter(enrollment=enrollment)
        completed_count = all_progress.filter(completed=True).count()
        total_count = all_progress.count()
        percentage = round((completed_count / total_count * 100), 2) if total_count > 0 else 0

        # Mark enrollment as completed if 100%
        if percentage == 100 and enrollment.status != 'completed':
            enrollment.status = 'completed'
            enrollment.completed_at = timezone.now()
            enrollment.save()
            logger.info(f"Student {request.user.id} COMPLETED Course {enrollment.course_id}")

        return Response({
            'success': True,
            'chapter_id': chapter_id,
            'viewed': progress.viewed,
            'completed': progress.completed,
            'completion_percentage': percentage
        })

    @action(detail=False, methods=['post'])
    def complete_lesson(self, request):
        """Legacy endpoint - mark chapter via quiz pass."""
        enrollment_id = request.data.get('enrollment_id')
        lesson_id = request.data.get('lesson_id')  # treated as chapter_id

        if not enrollment_id or not lesson_id:
            return Response({'error': 'enrollment_id and lesson_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enrollment = Enrollment.objects.get(id=enrollment_id, student_id=request.user.id)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)

        progress, _ = Progress.objects.get_or_create(
            enrollment=enrollment,
            chapter_id=lesson_id,
            defaults={'viewed': True, 'quiz_passed': False, 'completed': False}
        )
        progress.viewed = True
        progress.quiz_passed = True
        progress._recalculate_completion()
        progress.save()

        all_progress = Progress.objects.filter(enrollment=enrollment)
        completed = all_progress.filter(completed=True).count()
        total = all_progress.count()
        percentage = round((completed / total * 100), 2) if total > 0 else 0

        return Response({
            'success': True,
            'lesson_id': lesson_id,
            'completed': progress.completed,
            'completion_percentage': percentage
        })
