import os
import sys
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "quiz_service.settings")
sys.path.append("/Users/test/Desktop/projetAOS/elearning_platform/quiz_service")
django.setup()

from api.models import Quiz, Question, Choice, QuizAttempt
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

# Note: Quiz service might have its own User model or use a mock.
# Let's just create a dummy attempt directly using models to see what happens.
# Or better, we can just look at the models.

print("Test script loaded.")
