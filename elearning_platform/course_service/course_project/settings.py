from pathlib import Path
import os
import consul
import socket

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-test-key-shared-1234567890')
DEBUG = True
ALLOWED_HOSTS = ['*']
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

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
        c = consul.Consul(host=consul_host, port=8500, socket_timeout=2)
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
        print(f"Successfully registered 'course-service' with Consul.")
    except Exception:
        # Avoid log spam in local dev if Consul is missing
        if os.getenv('DEBUG') == 'True':
            print(f"Consul not reached (course-service). Discovery features disabled.")
        else:
            print(f"Warning: Could not register with Consul. Check connection at {consul_host}:8500")

threading.Thread(target=register_consul).start()

MEDIA_URL = '/api/courses/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
