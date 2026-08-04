import json
import threading

import pika

from common.config import Config
from sender import service as sender_service


def _handle_message(ch, method, properties, body):
    try:
        data = json.loads(body)
        routing_key = method.routing_key

        if routing_key == "classification.completed":
            user_id = data.get("user_id", "")
            tweet_id = data.get("tweet_id", "")
            label = data.get("label", "unknown")
            confidence = data.get("confidence", 0.0)
            title = f"Classification: {label}"
            content = (
                f"Tweet {tweet_id} classified as {label} ({confidence}%)"
            )
            sender_service.send(
                user_id=user_id,
                type_="classification",
                title=title,
                content=content,
            )
        elif routing_key == "issue.resolved":
            issue_id = data.get("issue_id", "")
            admin_id = data.get("admin_id", "")
            notes = data.get("notes", "")
            title = "Issue Resolved"
            content = (
                f"Issue {issue_id} resolved by {admin_id}: {notes}"
            )
            sender_service.send(
                user_id=admin_id,
                type_="resolution",
                title=title,
                content=content,
            )
        elif routing_key == "alert.triggered":
            user_id = data.get("user_id", "")
            alert_type = data.get("type", "alert")
            title = data.get("title", "Alert Triggered")
            content = data.get("content", "")
            sender_service.send(
                user_id=user_id,
                type_=alert_type,
                title=title,
                content=content,
            )
        else:
            # Generic handling — expects user_id, type, title, content
            user_id = data.get("user_id", "")
            notif_type = data.get("type", "general")
            title = data.get("title", "")
            content = data.get("content", "")
            sender_service.send(
                user_id=user_id,
                type_=notif_type,
                title=title,
                content=content,
            )

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"[RabbitMQ] Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def _run_consumer():
    try:
        params = pika.URLParameters(Config.RABBITMQ_URI)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(
            exchange="ecoguard.events",
            exchange_type="topic",
            durable=True,
        )

        result = channel.queue_declare(queue="", exclusive=True)
        queue_name = result.method.queue

        for key in ["classification.completed", "alert.triggered", "issue.resolved"]:
            channel.queue_bind(
                exchange="ecoguard.events",
                queue=queue_name,
                routing_key=key,
            )

        channel.basic_consume(
            queue=queue_name,
            on_message_callback=_handle_message,
        )

        print("[RabbitMQ] Consumer started, waiting for messages...")
        channel.start_consuming()
    except Exception as e:
        print(f"[RabbitMQ] Consumer failed to start: {e}")


def start_consumer():
    thread = threading.Thread(target=_run_consumer, daemon=True)
    thread.start()
