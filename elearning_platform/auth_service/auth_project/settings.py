from pathlib import Path
from datetime import timedelta
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
    'auth_app',
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

ROOT_URLCONF = 'auth_project.urls'
WSGI_APPLICATION = 'auth_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_USER_MODEL = 'auth_app.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
}

CORS_ALLOW_ALL_ORIGINS = True

MEDIA_URL = '/api/auth/media/'
MEDIA_ROOT = BASE_DIR / 'media'

import threading

def register_consul():
    port = int(os.environ.get('PORT', 8001))
    consul_host = os.environ.get('CONSUL_HOST', 'consul')
    service_ip = os.environ.get('SERVICE_IP', socket.gethostbyname(socket.gethostname()))
    try:
        c = consul.Consul(host=consul_host, port=8500, socket_timeout=2)
        c.agent.service.register(
            'auth-service',
            service_id=f'auth_service_{port}',
            port=port,
            address=service_ip,
            tags=[
                "traefik.enable=true",
                "traefik.http.routers.auth.rule=PathPrefix(`/api/auth`) || PathPrefix(`/media/`)",
                "traefik.http.routers.auth.priority=10",
            ]
        )
        print(f"Successfully registered 'auth-service' with Consul.")
    except Exception:
        # Avoid log spam in local dev if Consul is missing
        if os.environ.get('DEBUG') == 'True':
            print(f"Consul not reached (auth-service). Discovery features disabled.")
        else:
            print(f"Warning: Could not register with Consul. Check connection at {consul_host}:8500")

# Call it directly (not recommended for production, but fine for simple prototype)
threading.Thread(target=register_consul).start()
