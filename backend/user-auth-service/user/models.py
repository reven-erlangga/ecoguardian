from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4


@dataclass
class User:
    id: str = field(default_factory=lambda: str(uuid4()))
    email: str = ""
    username: str = ""
    password_hash: str = ""
    role: str = "user"
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "password_hash": self.password_hash,
            "role": self.role,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, d):
        return cls(
            id=d["id"],
            email=d["email"],
            username=d["username"],
            password_hash=d.get("password_hash", ""),
            role=d.get("role", "user"),
            created_at=d.get("created_at", datetime.utcnow()),
            updated_at=d.get("updated_at", datetime.utcnow()),
        )
