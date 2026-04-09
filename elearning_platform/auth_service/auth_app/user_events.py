import pika
import os
import json
import logging

logger = logging.getLogger(__name__)

def publish_user_deleted(user_id):
    """Publishes a user.deleted event to RabbitMQ."""
    rabbitmq_host = os.environ.get("RABBITMQ_HOST", "rabbitmq")
    
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
        channel = connection.channel()
        
        # Declare a topic exchange for user events
        channel.exchange_declare(exchange='user_events', exchange_type='topic', durable=True)
        
        message = {
            "event": "USER_DELETED",
            "user_id": user_id,
            "timestamp": str(os.times()) # Simple timestamp fallback
        }
        
        channel.basic_publish(
            exchange='user_events',
            routing_key='user.deleted',
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            )
        )
        logger.info(f"Published USER_DELETED event for user_id: {user_id}")
        connection.close()
    except Exception as e:
        logger.error(f"Failed to publish user deletion event: {e}")
