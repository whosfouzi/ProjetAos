import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer
from .models import User
from .permissions import IsAdminUser

# Configure logging
logging.basicConfig(level=logging.INFO, format='[AUTH-SERVICE] [%(asctime)s] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

from .user_events import publish_user_deleted

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            logger.info(f"User {username} (ID: {user.id}) logged in successfully")
            refresh = RefreshToken.for_user(user)
            # Add custom claims
            refresh['role'] = user.role
            refresh['user_id'] = user.id
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'user_id': user.id
            })
        logger.warning(f"Failed login attempt for username: {username}")
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# ---------------------------------------------------------
# Administrative API Views
# ---------------------------------------------------------

class AdminStatsView(APIView):
    """Returns high-level user statistics for the dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        stats = {
            "total_users": User.objects.count(),
            "students": User.objects.filter(role='student').count(),
            "instructors": User.objects.filter(role='instructor').count(),
            "admins": User.objects.filter(role='admin').count(),
        }
        return Response(stats)

class AdminUserListView(generics.ListAPIView):
    """Provides a searchable and filterable list of all platform users."""
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filtering by Role
        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=role_filter)
            
        # Filtering by Inactivity (Flag users who haven't logged in for 6 months)
        inactive_only = self.request.query_params.get('inactive') == 'true'
        if inactive_only:
            six_months_ago = timezone.now() - timedelta(days=180)
            queryset = queryset.filter(Q(last_login__lt=six_months_ago) | Q(last_login__isnull=True))
            
        # Searching
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(username__icontains=search) | Q(email__icontains=search))
            
        return queryset

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows an administrator to modify or delete a specific user account."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        # Restriction: Admins cannot demote themselves accidentally via this API
        if int(kwargs['pk']) == request.user.id and request.data.get('role') != 'admin':
             return Response({"error": "You cannot change your own admin role."}, status=status.HTTP_400_BAD_REQUEST)
        return super().patch(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user_id = int(kwargs['pk'])
        if user_id == request.user.id:
            return Response({"error": "You cannot delete your own admin account."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Publish deletion event BEFORE deleting from local DB to ensure we have the ID data
        publish_user_deleted(user_id)
        
        return super().destroy(request, *args, **kwargs)
