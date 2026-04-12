from django.urls import path
from . import views

urlpatterns = [
    path('register', views.RegisterView.as_view(), name='register'),
    path('login', views.LoginView.as_view(), name='login'),
    path('profile/me/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Admin Endpoints
    path('admin/stats', views.AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
]
