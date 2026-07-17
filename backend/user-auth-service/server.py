"""
User & Auth Service — gRPC server
"""

import os
import sys
from concurrent import futures

import grpc

service_dir = os.path.dirname(os.path.abspath(__file__))
# ponytail: insert proto first — namespace package handles common/
sys.path.insert(0, os.path.join(service_dir, "proto"))

from user import user_pb2, service_pb2, service_pb2_grpc
from common import common_pb2 as common_pb2

from common.db import init_db
import auth.service as auth_service
import user.service as user_service


def _dt_to_timestamp(dt):
    return common_pb2.Timestamp(seconds=int(dt.timestamp()), nanos=dt.microsecond * 1000)


def _user_to_proto(user_dict: dict):
    return user_pb2.User(
        id=user_dict["id"],
        email=user_dict["email"],
        username=user_dict["username"],
        role=user_dict["role"],
        created_at=_dt_to_timestamp(user_dict["created_at"]),
        updated_at=_dt_to_timestamp(user_dict["updated_at"]),
    )


# ─── UserService ───────────────────────────────────────────


class UserServiceServicer(service_pb2_grpc.UserServiceServicer):
    def Register(self, request, context):
        try:
            result = auth_service.register(
                email=request.email,
                username=request.username,
                password=request.password,
            )
            return user_pb2.RegisterResponse(
                user=_user_to_proto(result["user"]), token=result["token"]
            )
        except ValueError as e:
            context.set_code(grpc.StatusCode.ALREADY_EXISTS)
            context.set_details(str(e))
            return user_pb2.RegisterResponse()

    def Login(self, request, context):
        try:
            result = auth_service.login(email=request.email, password=request.password)
            return user_pb2.LoginResponse(
                user=_user_to_proto(result["user"]), token=result["token"]
            )
        except ValueError as e:
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details(str(e))
            return user_pb2.LoginResponse()

    def GetUser(self, request, context):
        user = user_service.get_user(request.id)
        if not user:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("User not found")
            return user_pb2.User()
        return _user_to_proto(user)

    def UpdateUser(self, request, context):
        user = user_service.update_user(
            id=request.id, email=request.email, username=request.username
        )
        if not user:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("User not found")
            return user_pb2.User()
        return _user_to_proto(user)


# ─── AuthService ───────────────────────────────────────────


class AuthServiceServicer(service_pb2_grpc.AuthServiceServicer):
    def ValidateToken(self, request, context):
        try:
            payload = auth_service.validate_token(request.token)
            return service_pb2.ValidateTokenResponse(
                user_id=payload["user_id"], role=payload["role"]
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details(str(e))
            return service_pb2.ValidateTokenResponse()

    def RefreshToken(self, request, context):
        try:
            result = auth_service.refresh_token(request.token)
            return service_pb2.RefreshTokenResponse(token=result["token"])
        except Exception as e:
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details(str(e))
            return service_pb2.RefreshTokenResponse()


# ─── Main ─────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    port = int(os.getenv("GRPC_PORT", "50051"))

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    service_pb2_grpc.add_UserServiceServicer_to_server(UserServiceServicer(), server)
    service_pb2_grpc.add_AuthServiceServicer_to_server(AuthServiceServicer(), server)

    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    print(f"✅ User & Auth Service gRPC server listening on port {port}")

    server.wait_for_termination()
