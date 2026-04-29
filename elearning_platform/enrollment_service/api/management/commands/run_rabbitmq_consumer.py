import pika
import os
import sys
import time
import json
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Enrollment, Progress
from api.producer import publish_course_completed

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Starts the RabbitMQ consumer for enrollment service'

    def handle(self, *args, **options):
        rabbitmq_host = os.environ.get("RABBITMQ_HOST", "rabbitmq")
        
        connection = None
        retries = 10
        while retries > 0:
            try:
                connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
                break
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Waiting for rabbitmq ({e})... {retries} retries left"))
                time.sleep(5)
                retries -= 1
                
        if not connection:
            self.stderr.write(self.style.ERROR("Failed to connect to RabbitMQ"))
            sys.exit(1)

        channel = connection.channel()
        channel.queue_declare(queue='quiz_passed', durable=True)
        
        # Setup for User Events exchange (Topic)
        channel.exchange_declare(exchange='user_events', exchange_type='topic', durable=True)
        result = channel.queue_declare(queue='enrollment_cleanup_queue', durable=True)
        cleanup_queue = result.method.queue
        channel.queue_bind(exchange='user_events', queue=cleanup_queue, routing_key='user.deleted')

        def callback_quiz(ch, method, properties, body):
            try:
                data = json.loads(body.decode())
                user_id = data.get('user_id')
                course_id = data.get('course_id')
                chapter_id = data.get('chapter_id')
                
                print(f" [x] Message Received: Student {user_id} passed Quiz in Chapter {chapter_id} (Course {course_id})")

                try:
                    enrollment = Enrollment.objects.get(student_id=user_id, course_id=course_id)
                    
                    # 1. Update the Chapter Progress
                    if chapter_id:
                        progress, created = Progress.objects.get_or_create(
                            student_id=user_id,
                            course_id=course_id,
                            chapter_id=chapter_id,
                            defaults={'viewed': False, 'quiz_passed': False, 'completed': False}
                        )
                        progress.mark_quiz_passed()
                        print(f"Chapter {chapter_id} marked as passed for User {user_id}")
                    
                    # 2. Recalculate Overall Course Completion
                    import requests
                    from django.conf import settings
                    valid_chapter_ids = []
                    try:
                        res = requests.get(f"{settings.COURSE_SERVICE_URL}/api/courses/{course_id}/", timeout=5)
                        if res.status_code == 200:
                            valid_chapter_ids = res.json().get('valid_chapter_ids', [])
                    except Exception as e:
                        print(f"Failed to fetch valid chapters: {e}")

                    all_progress = Progress.objects.filter(student_id=user_id, course_id=course_id)
                    if isinstance(valid_chapter_ids, list):
                        total_chapters = len(valid_chapter_ids)
                        completed_chapters = all_progress.filter(completed=True, chapter_id__in=valid_chapter_ids).count()
                    else:
                        total_chapters = all_progress.count()
                        completed_chapters = all_progress.filter(completed=True).count()
                    
                    if total_chapters > 0 and completed_chapters == total_chapters:
                        if enrollment.status != 'completed':
                            enrollment.status = 'completed'
                            enrollment.completed_at = timezone.now()
                            enrollment.save()
                            print(f"Course {course_id} fully completed for User {user_id}!")
                            publish_course_completed(user_id, course_id)
                            
                except Enrollment.DoesNotExist:
                     print(f"Enrollment not found for Student {user_id}, Course {course_id}.")
            except Exception as e:
                print(f"Error processing quiz_passed: {e}")

        def callback_cleanup(ch, method, properties, body):
            try:
                data = json.loads(body.decode())
                user_id = data.get('user_id')
                if user_id:
                    print(f" [x] Cleanup request received for User ID: {user_id}")
                    count, _ = Enrollment.objects.filter(student_id=user_id).delete()
                    print(f" [x] Deleted {count} enrollment records for User {user_id}")
            except Exception as e:
                print(f"Error processing user_deleted: {e}")

        channel.basic_consume(queue='quiz_passed', on_message_callback=callback_quiz, auto_ack=True)
        channel.basic_consume(queue=cleanup_queue, on_message_callback=callback_cleanup, auto_ack=True)

        self.stdout.write(self.style.SUCCESS(' [*] Enrollment Workers (Quiz/Cleanup) waiting for events. To exit press CTRL+C'))
        channel.start_consuming()
