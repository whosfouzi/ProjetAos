import pika
import os
import json

def publish_course_completed(student_id, course_id):
    try:
        rabbitmq_host = os.environ.get("RABBITMQ_HOST", "rabbitmq")
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
        channel = connection.channel()
        channel.queue_declare(queue='course_completed', durable=True)
        
        message = json.dumps({
            "user_id": student_id,
            "course_id": course_id
        })
        channel.basic_publish(
            exchange='', 
            routing_key='course_completed', 
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2, # persistent
            )
        )
        connection.close()
    except Exception as e:
        print(f"Failed to publish course_completed to RabbitMQ: {e}")
