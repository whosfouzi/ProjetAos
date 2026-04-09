import pika
import os
import json

def publish_quiz_passed(user_id, course_id, chapter_id, score, total_quizzes):
    try:
        rabbitmq_host = os.environ.get("RABBITMQ_HOST", "rabbitmq")
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
        channel = connection.channel()
        channel.queue_declare(queue='quiz_passed', durable=True)
        
        message = json.dumps({
            "user_id": user_id,
            "course_id": course_id,
            "chapter_id": chapter_id,
            "score": score,
            "total_quizzes": total_quizzes
        })
        channel.basic_publish(
            exchange='', 
            routing_key='quiz_passed', 
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2, # persistent
            )
        )
        connection.close()
    except Exception as e:
        print(f"Failed to publish quiz_passed to RabbitMQ: {e}")
