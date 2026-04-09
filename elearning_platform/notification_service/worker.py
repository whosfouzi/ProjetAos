import pika
import os
import sys
import time
import json

def main():
    rabbitmq_host = os.environ.get("RABBITMQ_HOST", "rabbitmq")
    
    # Wait for RabbitMQ to be ready
    connection = None
    retries = 10
    while retries > 0:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
            break
        except Exception as e:
            print(f"Waiting for rabbitmq ({e})... {retries} retries left")
            time.sleep(5)
            retries -= 1
            
    if not connection:
        print("Failed to connect to RabbitMQ")
        sys.exit(1)

    channel = connection.channel()
    channel.queue_declare(queue='enrollments', durable=True)
    channel.queue_declare(queue='course_completed', durable=True)

    def callback_enrollment(ch, method, properties, body):
        try:
            data = json.loads(body.decode())
            print(f"[Notification Service] User {data['user_id']} successfully enrolled in Course {data['course_id']}")
        except Exception as e:
            print(f"[*] Received non-JSON message: {body.decode()}")

    def callback_course_completed(ch, method, properties, body):
        try:
            data = json.loads(body.decode())
            print(f"[Notification Service] Congratulations! Course {data['course_id']} completed. Certificate emailed to User {data['user_id']}!")
        except Exception as e:
            print(f"[*] Received non-JSON message: {body.decode()}")

    channel.basic_consume(queue='enrollments', on_message_callback=callback_enrollment, auto_ack=True)
    channel.basic_consume(queue='course_completed', on_message_callback=callback_course_completed, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        sys.exit(0)
