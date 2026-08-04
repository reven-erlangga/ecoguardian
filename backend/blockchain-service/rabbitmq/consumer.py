"""
RabbitMQ consumer untuk Blockchain Service.
Listen issue.resolved events dan create block.
"""

import json
import threading
import time

import pika
from chain.blockchain import Blockchain
from chain.repository import BlockRepository
from common.config import Config


class BlockchainEventConsumer:
    def __init__(self, chain: Blockchain, repo: BlockRepository):
        self.chain = chain
        self.repo = repo

    def _handle(self, ch, method, properties, body):
        try:
            data = json.loads(body)
            routing_key = method.routing_key

            if routing_key == "issue.resolved":
                issue_id = data.get("issue_id", "")
                tweet_id = data.get("tweet_id", "")
                admin_id = data.get("admin_id", "")
                notes = data.get("notes", "")
                image_hashes = data.get("image_hashes", [])
                resolved_at = data.get("resolved_at", int(time.time()))

                block_data = {
                    "type": "resolution",
                    "tweet_id": tweet_id,
                    "label": "",
                    "confidence": 0,
                    "image_hash": image_hashes[0] if image_hashes else "",
                    "location": None,
                    "resolution": {
                        "admin_id": admin_id,
                        "notes": notes,
                        "resolved_image_hash": image_hashes[0] if image_hashes else "",
                        "resolved_at": resolved_at,
                    },
                }

                last = self.repo.get_last_block()
                if not last:
                    new_block = self.chain.create_genesis()
                    self.repo.add_block(new_block)
                    last = new_block
                new_block = self.chain.create_block(block_data, last)
                if self.repo.add_block(new_block):
                    print(f"[Blockchain] Block created for issue {issue_id}")
                else:
                    print(f"[Blockchain] Failed to store block for {issue_id}")

            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f"[Blockchain] Consumer error: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def start(self):
        try:
            cfg = Config()
            params = pika.URLParameters(cfg.RABBITMQ_URI)
            params.heartbeat = 300
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.exchange_declare(
                exchange="ecoguard.events",
                exchange_type="topic",
                durable=True,
            )

            result = channel.queue_declare(queue="", exclusive=True)
            queue_name = result.method.queue
            channel.queue_bind(
                exchange="ecoguard.events",
                queue=queue_name,
                routing_key="issue.resolved",
            )

            channel.basic_consume(
                queue=queue_name,
                on_message_callback=self._handle,
            )
            print("[Blockchain] RabbitMQ consumer started for issue.resolved")
            channel.start_consuming()
        except Exception as e:
            print(f"[Blockchain] RabbitMQ consumer failed: {e}")
