from pathlib import Path
import os
import consul
import socket

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-test-key')
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'rest_framework',
    'corsheaders',
    'course_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'course_project.urls'
WSGI_APPLICATION = 'course_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'course_project.auth_backends.StatelessJWTAuthentication',
    )
}

CORS_ALLOW_ALL_ORIGINS = True

import threading

def register_consul():
    port = int(os.environ.get('PORT', 8002))
    consul_host = os.environ.get('CONSUL_HOST', 'consul')
    service_ip = os.environ.get('SERVICE_IP', socket.gethostbyname(socket.gethostname()))
    try:
        c = consul.Consul(host=consul_host, port=8500)
        c.agent.service.register(
            'course-service',
            service_id=f'course_service_{port}',
            port=port,
            address=service_ip,
            tags=[
                "traefik.enable=true",
                "traefik.http.routers.course.rule=PathPrefix(`/api/courses`)",
                "traefik.http.routers.course.priority=10",
            ]
        )
        print(f"Registered with Consul at {service_ip}:{port}")
    except Exception as e:
        print(f"Failed to register with Consul: {e}")

threading.Thread(target=register_consul).start()

MEDIA_URL = '/api/courses/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
