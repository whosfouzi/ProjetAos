import pika
import os
import sys
import time
import json
import logging
from django.core.management.base import BaseCommand
from api.models import QuizAttempt

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Starts the RabbitMQ consumer for quiz service cleanup'

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
        
        # Setup for User Events exchange (Topic)
        channel.exchange_declare(exchange='user_events', exchange_type='topic', durable=True)
        result = channel.queue_declare(queue='quiz_cleanup_queue', durable=True)
        cleanup_queue = result.method.queue
        channel.queue_bind(exchange='user_events', queue=cleanup_queue, routing_key='user.deleted')

        def callback_cleanup(ch, method, properties, body):
            try:
                data = json.loads(body.decode())
                user_id = data.get('user_id')
                if user_id:
                    print(f" [x] Cleanup request received (Quiz Service) for User ID: {user_id}")
                    # QuizAttempt deletion will cascade to Answer
                    count, _ = QuizAttempt.objects.filter(student_id=user_id).delete()
                    print(f" [x] Deleted {count} quiz attempt records for User {user_id}")
            except Exception as e:
                print(f"Error processing user_deleted in Quiz Service: {e}")

        channel.basic_consume(queue=cleanup_queue, on_message_callback=callback_cleanup, auto_ack=True)

        self.stdout.write(self.style.SUCCESS(' [*] Quiz Cleanup Worker waiting for events. To exit press CTRL+C'))
        channel.start_consuming()
