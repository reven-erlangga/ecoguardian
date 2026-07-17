"""
Unit tests for password hashing / verification
"""

import sys
from pathlib import Path

import pytest

# ── Ensure package root is on sys.path ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

from auth.password import hash_password, verify_password


PASSWORD = "SuperSecret123!"
OTHER_PASSWORD = "WrongPassword456!"


def test_hash_password_returns_non_empty_string():
    hashed = hash_password(PASSWORD)
    assert isinstance(hashed, str)
    assert len(hashed) > 0


def test_hash_password_returns_different_hash_each_time():
    h1 = hash_password(PASSWORD)
    h2 = hash_password(PASSWORD)
    assert h1 != h2  # bcrypt gensalt ensures uniqueness


def test_verify_password_returns_true_for_correct_password():
    hashed = hash_password(PASSWORD)
    assert verify_password(PASSWORD, hashed) is True


def test_verify_password_returns_false_for_wrong_password():
    hashed = hash_password(PASSWORD)
    assert verify_password(OTHER_PASSWORD, hashed) is False


def test_verify_password_returns_false_for_empty_string():
    hashed = hash_password(PASSWORD)
    assert verify_password("", hashed) is False
