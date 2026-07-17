from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Notification:
    id: str
    user_id: str
    type: str
    title: str
    content: str
    status: str
    created_at: datetime
    read_at: Optional[datetime] = None
    channel: str = ""
