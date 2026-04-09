from django.db import models
from django.utils import timezone


class Enrollment(models.Model):
    student_id = models.IntegerField()
    course_id = models.IntegerField()
    enrolled_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('dropped', 'Dropped'),
        ],
        default='active'
    )
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['student_id', 'course_id']
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['course_id']),
        ]

    def __str__(self):
        return f"Student {self.student_id} -> Course {self.course_id}"


class Progress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='progress')
    chapter_id = models.IntegerField()
    viewed = models.BooleanField(default=False)
    viewed_at = models.DateTimeField(null=True, blank=True)
    quiz_passed = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['enrollment', 'chapter_id']
        indexes = [
            models.Index(fields=['enrollment', 'completed']),
        ]

    def __str__(self):
        return f"Progress: {self.enrollment} - Chapter {self.chapter_id}: {'Done' if self.completed else 'In Progress'}"

    def mark_viewed(self):
        if not self.viewed:
            self.viewed = True
            self.viewed_at = timezone.now()
        self._recalculate_completion()
        self.save()

    def mark_quiz_passed(self):
        self.quiz_passed = True
        self._recalculate_completion()
        self.save()

    def _recalculate_completion(self):
        """Chapter is complete if viewed AND (quiz passed OR no quiz exists for this chapter)."""
        if self.viewed and self.quiz_passed:
            if not self.completed:
                self.completed = True
                self.completed_at = timezone.now()
        elif self.viewed:
            # Viewed but no quiz required — mark as complete (caller sets quiz_passed=True when no quiz)
            pass  # quiz_passed controls this

