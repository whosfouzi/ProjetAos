from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')
router.register(r'progress', views.ProgressViewSet, basename='progress')

urlpatterns = [
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('admin/enrollments/', views.AdminEnrollmentListView.as_view(), name='admin-enrollments'),
    path('', include(router.urls)),
]