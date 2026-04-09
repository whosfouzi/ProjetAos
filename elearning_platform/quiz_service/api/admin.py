from django.contrib import admin
from .models import Quiz, Question, Choice, ShortAnswer, QuizAttempt, Answer

admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(ShortAnswer)
admin.site.register(QuizAttempt)
admin.site.register(Answer)