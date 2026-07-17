import sys
import os

# ponytail: append proto agar common/ real ditemukan duluan
_proto = os.path.join(os.path.dirname(__file__), "proto")
sys.path.insert(0, _proto)

from notification import notification_pb2, service_pb2, service_pb2_grpc

import grpc

from common.config import Config
from common.db import init_db
from common.grpc_server import serve
from sender import service as sender_service
from rabbitmq.consumer import start_consumer


class NotificationServiceServicer(service_pb2_grpc.NotificationServiceServicer):

    def SendNotification(self, request, context):
        notif = sender_service.send(
            user_id=request.user_id,
            type_=request.type,
            title=request.title,
            content=request.content,
            channel=request.channel,
        )
        return notification_pb2.SendNotificationResponse(id=notif["id"])

    def GetNotifications(self, request, context):
        pagination = request.pagination
        page = pagination.page if pagination and pagination.page else 1
        per_page = (
            pagination.per_page if pagination and pagination.per_page else 20
        )
        status = request.status if request.status else None

        items, total = sender_service.list_notifications(
            user_id=request.user_id,
            status=status,
            page=page,
            per_page=per_page,
        )

        resp = notification_pb2.GetNotificationsResponse()
        resp.pagination.page = page
        resp.pagination.per_page = per_page
        resp.pagination.total = total

        for item in items:
            n = resp.notifications.add()
            n.id = item["id"]
            n.user_id = item["user_id"]
            n.type = item["type"]
            n.channel = item.get("channel", "")
            n.title = item["title"]
            n.content = item["content"]
            n.status = item["status"]

        return resp

    def MarkRead(self, request, context):
        sender_service.mark_read(
            notification_id=request.id,
            user_id=request.user_id,
        )
        return common_pb2.Empty()


if __name__ == "__main__":
    print("[Server] Initializing database...")
    init_db()

    print("[Server] Starting RabbitMQ consumer...")
    start_consumer()

    print(f"[Server] Starting gRPC server on port {Config.GRPC_PORT}...")
    serve(
        NotificationServiceServicer,
        service_pb2_grpc.add_NotificationServiceServicer_to_server,
    )
