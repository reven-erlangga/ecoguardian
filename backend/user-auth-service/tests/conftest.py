"""Mock external deps before any service module is imported."""

import sys
from unittest.mock import MagicMock

# ponytail: mock psycopg2 so tests run without Postgres
sys.modules["psycopg2"] = MagicMock()
sys.modules["psycopg2.extras"] = MagicMock()
sys.modules["psycopg2.pool"] = MagicMock()
sys.modules["psycopg2.extensions"] = MagicMock()
