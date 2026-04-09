from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    
    # Academic Classification Endpoints
    path('domains/', views.DomainListView.as_view(), name='domain-list'),
    path('specializations/', views.SpecializationListView.as_view(), name='specialization-list'),
    path('expertise/', views.InstructorExpertiseView.as_view(), name='instructor-expertise'),
    
    # Admin Stats
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    
    # Chapter endpoints (scoped to a course)
    path('<int:pk>/chapters/', views.ChapterListView.as_view(), name='chapter-list'),
    # Chapter management (standalone by chapter ID)
    path('chapters/<int:pk>/', views.ChapterDetailView.as_view(), name='chapter-detail'),
    path('chapters/<int:pk>/pdf/', views.ChapterPDFDeleteView.as_view(), name='chapter-pdf-delete'),
]
