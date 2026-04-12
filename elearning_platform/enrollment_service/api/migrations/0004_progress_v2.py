from django.db import migrations, models
import django.db.models.deletion

def populate_from_enrollment(apps, schema_editor):
    Progress = apps.get_model('api', 'Progress')
    for p in Progress.objects.all():
        if p.enrollment:
            p.student_id = p.enrollment.student_id
            p.course_id = p.enrollment.course_id
            p.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_rename_lesson_id_progress_chapter_id_and_more'),
    ]

    operations = [
        # 1. Add new fields as nullable
        migrations.AddField(
            model_name='progress',
            name='course_id',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='progress',
            name='student_id',
            field=models.IntegerField(null=True),
        ),
        
        # 2. Run data migration
        migrations.RunPython(populate_from_enrollment),

        # 3. Clean up unique_together (remove old one)
        migrations.AlterUniqueTogether(
            name='progress',
            unique_together=set(),
        ),

        # 4. Remove enrollment field
        migrations.RemoveField(
            model_name='progress',
            name='enrollment',
        ),

        # 5. Make new fields non-nullable
        migrations.AlterField(
            model_name='progress',
            name='course_id',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='progress',
            name='student_id',
            field=models.IntegerField(),
        ),

        # 6. Apply new metadata (constraints and indexes)
        migrations.AlterUniqueTogether(
            name='progress',
            unique_together={('student_id', 'course_id', 'chapter_id')},
        ),
        migrations.AddIndex(
            model_name='progress',
            index=models.Index(fields=['student_id', 'course_id'], name='api_progres_student_447470_idx'),
        ),
        migrations.AddIndex(
            model_name='progress',
            index=models.Index(fields=['completed'], name='api_progres_complet_631627_idx'),
        ),
    ]
