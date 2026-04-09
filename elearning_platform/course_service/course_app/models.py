from django.db import models
from django.core.validators import FileExtensionValidator

class Domain(models.Model):
    """Top-level academic area (e.g. Computer Science, Physics)"""
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class Specialization(models.Model):
    """Specific expertise area within a domain (e.g. Web Development)"""
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='specializations')
    name = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('domain', 'name')
    def __str__(self): return f"{self.domain.name} - {self.name}"

class InstructorSpecialization(models.Model):
    """Links an instructor ID (from Auth Service) to their verified expertises."""
    instructor_id = models.IntegerField()
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('instructor_id', 'specialization')
    def __str__(self): return f"Instructor {self.instructor_id} - {self.specialization.name}"

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor_id = models.IntegerField(default=1) # Link to instructor user ID
    specialization = models.ForeignKey(Specialization, on_delete=models.PROTECT, null=True)
    
    @property
    def domain_name(self):
        return self.specialization.domain.name if self.specialization else "General"
    
    @property
    def category_name(self):
        return self.specialization.name if self.specialization else "Other"

    def __str__(self):
        return self.title

class Chapter(models.Model):
    """A structured module within a course."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    pdf_file = models.FileField(
        upload_to='chapter_pdfs/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])]
    )
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.course.title} - Chapter {self.order}: {self.title}"
