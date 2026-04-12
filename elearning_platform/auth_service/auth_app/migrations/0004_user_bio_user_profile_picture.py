from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0002_alter_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='bio',
            field=models.TextField(blank=True, max_length=500),
        ),
        migrations.AddField(
            model_name='user',
            name='profile_picture',
            field=models.FileField(blank=True, null=True, upload_to='profile_pics/'),
        ),
    ]
