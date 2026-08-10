"""Unit tests untuk Setup API clustering (lib/setup.py)."""

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_PKG = os.path.dirname(_HERE)
sys.path.insert(0, _PKG)

import pytest

from lib.setup import build_setup_app


class FakeRepo:
    """Stub repository — tidak butuh MongoDB."""

    def __init__(self):
        self._saved = None

    def get_clustering_settings(self):
        if self._saved is None:
            return {"eps_km": 7.0, "min_pts": 3, "source": "env-default"}
        return dict(self._saved)

    def save_clustering_settings(self, eps_km, min_pts):
        self._saved = {
            "eps_km": float(eps_km),
            "min_pts": int(min_pts),
            "source": "mongodb",
            "updated_at": 12345,
        }
        return dict(self._saved)


@pytest.fixture
def client():
    app = build_setup_app(FakeRepo())
    app.config["TESTING"] = True
    return app.test_client()


def test_get_returns_env_default(client):
    body = client.get("/setup/clustering").get_json()
    assert body["eps_km"] == 7.0
    assert body["min_pts"] == 3
    assert body["source"] == "env-default"


def test_save_persists_settings(client):
    resp = client.post("/setup/clustering", json={"eps_km": 1.5, "min_pts": 10})
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["eps_km"] == 1.5
    assert body["min_pts"] == 10
    assert body["source"] == "mongodb"


def test_save_then_get_reflects_new_values(client):
    client.post("/setup/clustering", json={"eps_km": 2.0, "min_pts": 5})
    body = client.get("/setup/clustering").get_json()
    assert body["eps_km"] == 2.0
    assert body["min_pts"] == 5


def test_save_invalid_values_400(client):
    assert client.post("/setup/clustering", json={"eps_km": -1, "min_pts": 0}).status_code == 400
    assert client.post("/setup/clustering", json={"eps_km": "abc"}).status_code == 400
    assert client.post("/setup/clustering", json={}).status_code == 400
