import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-test-key-shared-1234567890')

DEBUG = True

ALLOWED_HOSTS = ['*']
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'quiz_service.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'quiz_service.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.JWTAuthentication',
    ],
}

COURSE_SERVICE_URL = os.environ.get('COURSE_SERVICE_URL', 'http://course-service:8002')

import threading
import socket
import consul

def register_consul():
    import time
    port = int(os.environ.get('PORT', 8004))
    consul_host = os.environ.get('CONSUL_HOST', 'consul')
    service_ip = os.environ.get('SERVICE_IP', socket.gethostbyname(socket.gethostname()))
    
    while True:
        try:
            c = consul.Consul(host=consul_host, port=8500, socket_timeout=2)
            c.agent.service.register(
                'quiz-service',
                service_id=f'quiz_service_{port}',
                port=port,
                address=service_ip,
                tags=[
                    "traefik.enable=true",
                    "traefik.http.routers.quiz.rule=PathPrefix(`/api/quizzes`)",
                    "traefik.http.routers.quiz.priority=10",
                ]
            )
            print(f"Successfully registered 'quiz-service' with Consul at {consul_host}:8500")
            break
        except Exception:
            print(f"Retrying Consul registration in 10s... ({consul_host}:8500)")
            time.sleep(10)

threading.Thread(target=register_consul, daemon=True).start()