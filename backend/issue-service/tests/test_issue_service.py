"""
Unit tests for IssueService gRPC handlers.
Mocks MongoDB repository and RabbitMQ publisher.
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock

import pytest

_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
_PROTO = _PKG / "proto"
for p in [_PROTO, _PKG]:
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

# ── Mock deps before importing service ─────────────────────
sys.modules["lib.db"] = MagicMock()
sys.modules["lib.config"] = MagicMock()
sys.modules["rabbitmq"] = MagicMock()
sys.modules["rabbitmq.EventPublisher"] = MagicMock()

from issue import service_pb2, service_pb2_grpc
from server import IssueServicer, _doc_to_issue


@pytest.fixture
def mock_repo():
    repo = MagicMock()
    repo.list_issues.return_value = ([], 0)
    repo.get_issue.return_value = None
    return repo


@pytest.fixture
def mock_publisher():
    return MagicMock()


@pytest.fixture
def servicer(mock_repo, mock_publisher):
    return IssueServicer(repo=mock_repo, publisher=mock_publisher)


def _make_context():
    class FakeContext:
        def __init__(self):
            self.code = None
            self.details = None
        def set_code(self, code):
            self.code = code
        def set_details(self, details):
            self.details = details
    return FakeContext()


class TestListIssues:

    def test_list_empty(self, servicer, mock_repo):
        mock_repo.list_issues.return_value = ([], 0)
        req = service_pb2.ListIssuesRequest()
        resp = servicer.ListIssues(req, _make_context())
        assert len(resp.issues) == 0
        assert resp.pagination.total == 0

    def test_list_with_results(self, servicer, mock_repo):
        mock_repo.list_issues.return_value = (
            [{"_id": "1", "tweet_id": "t1", "type": "garbage", "confidence": 0.9,
              "status": "open", "created_at": 1000, "image_hashes": []}],
            1,
        )
        req = service_pb2.ListIssuesRequest()
        resp = servicer.ListIssues(req, _make_context())
        assert len(resp.issues) == 1
        assert resp.issues[0].tweet_id == "t1"
        assert resp.issues[0].type == "garbage"


class TestGetIssue:

    def test_get_existing(self, servicer, mock_repo):
        mock_repo.get_issue.return_value = {
            "_id": "abc", "tweet_id": "t1", "type": "vandalism",
            "confidence": 0.85, "status": "open", "created_at": 1000,
            "paraphrased_text": "test", "image_hashes": [],
        }
        req = service_pb2.GetIssueRequest(id="abc")
        resp = servicer.GetIssue(req, _make_context())
        assert resp.issue.id == "abc"
        assert resp.issue.type == "vandalism"

    def test_get_nonexistent(self, servicer, mock_repo):
        mock_repo.get_issue.return_value = None
        ctx = _make_context()
        resp = servicer.GetIssue(service_pb2.GetIssueRequest(id="missing"), ctx)
        assert ctx.code is not None


class TestResolveIssue:

    def test_resolve_existing(self, servicer, mock_repo, mock_publisher):
        mock_repo.get_issue.return_value = {
            "_id": "abc", "tweet_id": "t1", "type": "garbage",
            "confidence": 0.9, "status": "open", "created_at": 1000,
            "image_hashes": [],
        }
        mock_repo.issues = MagicMock()
        req = service_pb2.ResolveIssueRequest(
            issue_id="abc", admin_id="admin1", notes="Done!"
        )
        resp = servicer.ResolveIssue(req, _make_context())
        assert resp.success is True
        mock_publisher.publish_issue_resolved.assert_called_once()

    def test_resolve_nonexistent(self, servicer, mock_repo):
        mock_repo.get_issue.return_value = None
        req = service_pb2.ResolveIssueRequest(issue_id="missing", admin_id="admin1")
        ctx = _make_context()
        resp = servicer.ResolveIssue(req, ctx)
        assert resp.success is False
        assert "not found" in resp.message


class TestDocConversion:

    def test_minimal_doc(self):
        doc = {"_id": "x", "tweet_id": "t1", "type": "flood",
               "confidence": 0.5, "status": "open", "created_at": 1000}
        issue = _doc_to_issue(doc)
        assert issue.id == "x"
        assert issue.type == "flood"
        assert issue.confidence == 0.5
        # Location defaults to empty message, not None
        assert issue.location.address == ""

    def test_with_location(self):
        doc = {"_id": "x", "tweet_id": "t1", "type": "flood",
               "confidence": 0.8, "status": "open", "created_at": 1000,
               "location": {"lat": -6.2, "lon": 106.8, "address": "Jakarta"},
        }
        issue = _doc_to_issue(doc)
        assert issue.location.lat == -6.2
        assert issue.location.address == "Jakarta"

    def test_with_resolution(self):
        doc = {"_id": "x", "tweet_id": "t1", "type": "garbage",
               "confidence": 0.9, "status": "resolved", "created_at": 1000,
               "resolution": {"admin_id": "a1", "notes": "cleaned",
                              "image_hashes": ["h1"], "resolved_at": 2000},
               "resolved_at": 2000,
        }
        issue = _doc_to_issue(doc)
        assert issue.resolution.admin_id == "a1"
        assert issue.resolved_at == 2000
