"""
RabbitMQ event publisher untuk Classification Service.
Publish event ke exchange ecoguard.events (topic).
"""

import json
import logging

import pika

logger = logging.getLogger(__name__)


class EventPublisher:
    """Publish classification results to RabbitMQ event bus."""

    def __init__(self, rabbitmq_uri: str):
        self.uri = rabbitmq_uri
        self.connection = None
        self.channel = None
        self._connect()

    def _connect(self):
        try:
            params = pika.URLParameters(self.uri)
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            self.channel.exchange_declare(
                exchange="ecoguard.events",
                exchange_type="topic",
                durable=True,
            )
            logger.info("Connected to RabbitMQ")
        except Exception as e:
            logger.warning("RabbitMQ connection failed: %s", e)
            logger.warning("Events will not be published")

    def publish_classification_completed(
        self, tweet_id: str, label: str, confidence: float
    ):
        """Publish classification.completed event."""
        if not self.channel:
            return
        body = json.dumps({
            "tweet_id": tweet_id,
            "label": label,
            "confidence": confidence,
        })
        try:
            self.channel.basic_publish(
                exchange="ecoguard.events",
                routing_key="classification.completed",
                body=body,
            )
            logger.info(
                "Published classification.completed: %s -> %s (%.2f)",
                tweet_id, label, confidence,
            )
        except Exception as e:
            logger.warning("Failed to publish event: %s", e)

    def close(self):
        if self.connection:
            try:
                self.connection.close()
            except Exception:
                pass
