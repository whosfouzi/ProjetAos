#!/bin/bash
cd /Users/test/Desktop/projetAOS/elearning_platform

# Requirements
cat << 'REQ' > requirements.txt
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
pika==1.3.2
python-consul==1.1.0
requests==2.31.0
REQ

# Auth Service
cd auth_service
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
django-admin startproject auth_project .
python manage.py startapp auth_app
deactivate
cd ..

# Course Service
cd course_service
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
django-admin startproject course_project .
python manage.py startapp course_app
deactivate
cd ..

# Enrollment Service
cd enrollment_service
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
django-admin startproject enrollment_project .
python manage.py startapp enrollment_app
deactivate
cd ..

chmod +x setup_services.sh
