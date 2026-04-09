#!/bin/bash
cd /Users/test/Desktop/projetAOS/elearning_platform

cat << 'REQ' > requirements.txt
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
pika==1.3.2
python-consul==1.1.0
requests==2.31.0
psycopg2-binary==2.9.9
REQ

for service in auth_service course_service enrollment_service; do
    cd $service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r ../requirements.txt 
    django-admin startproject ${service%_*}_project .
    python3 manage.py startapp ${service%_*}_app
    deactivate
    cd ..
done
