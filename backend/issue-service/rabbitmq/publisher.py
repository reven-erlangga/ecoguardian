"""
RabbitMQ event publisher untuk Issue Service.
Publish event ke exchange ecoguard.events (topic).
"""

import json
import logging

import pika

logger = logging.getLogger(__name__)


class EventPublisher:
    """Publish issue events (resolve, create) to RabbitMQ event bus."""

    def __init__(self, rabbitmq_uri: str):
        self.uri = rabbitmq_uri
        self.connection = None
        self.channel = None
        self._connect()

    def _connect(self):
        try:
            params = pika.URLParameters(self.uri)
            params.heartbeat = 300  # 5 menit heartbeat
            params.blocked_connection_timeout = 30
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
            self.connection = None
            self.channel = None

    def _ensure_connected(self):
        """Reconnect if connection is closed/stale."""
        if self.connection and self.connection.is_open:
            return True
        logger.info("RabbitMQ connection lost, reconnecting...")
        self._connect()
        return self.channel is not None

    def publish_issue_resolved(
        self, issue_id: str, tweet_id: str, admin_id: str, notes: str,
        image_hashes: list[str], resolved_at: int,
    ):
        """Publish issue.resolved event."""
        if not self._ensure_connected():
            return
        body = json.dumps({
            "event": "issue.resolved",
            "issue_id": issue_id,
            "tweet_id": tweet_id,
            "admin_id": admin_id,
            "notes": notes,
            "image_hashes": image_hashes,
            "resolved_at": resolved_at,
        })
        try:
            self.channel.basic_publish(
                exchange="ecoguard.events",
                routing_key="issue.resolved",
                body=body,
                properties=pika.BasicProperties(delivery_mode=2),
            )
            logger.info("Published issue.resolved: %s", issue_id)
        except Exception as e:
            logger.warning("Failed to publish event: %s", e)

    def close(self):
        if self.connection:
            try:
                self.connection.close()
            except Exception:
                pass
