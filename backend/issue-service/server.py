"""Issue Service — gRPC server for issue management"""

import os, sys, time
from concurrent import futures

import grpc

_proj = os.path.dirname(os.path.abspath(__file__))
_proto = os.path.join(_proj, "proto")
sys.path.insert(0, _proto)
sys.path.insert(1, _proj)

from lib.config import Config
from lib.db import IssueRepository
from lib.dashboard import DashboardServicer
from common import common_pb2
from issue import issue_pb2, service_pb2, service_pb2_grpc
from dashboard import service_pb2_grpc as dashboard_service_pb2_grpc
from rabbitmq import EventPublisher


def _doc_to_issue(doc: dict) -> issue_pb2.Issue:
    loc = doc.get("location") or {}
    res = doc.get("resolution") or {}
    return issue_pb2.Issue(
        id=str(doc.get("_id", doc.get("id", ""))),
        tweet_id=doc.get("tweet_id", ""),
        type=doc.get("type", ""),
        confidence=float(doc.get("confidence", 0)),
        status=doc.get("status", "open"),
        location=issue_pb2.Location(
            lat=float(loc.get("lat", 0)), lon=float(loc.get("lon", 0)),
            address=loc.get("address", ""),
        ) if doc.get("location") else None,
        paraphrased_text=doc.get("paraphrased_text", ""),
        resolution=issue_pb2.Resolution(
            admin_id=res.get("admin_id", ""), notes=res.get("notes", ""),
            image_hashes=res.get("image_hashes", []), resolved_at=int(res.get("resolved_at", 0)),
        ) if doc.get("resolution") else None,
        image_hashes=doc.get("image_hashes", []),
        created_at=int(doc.get("created_at", 0)),
        resolved_at=int(doc.get("resolved_at", 0)) if doc.get("resolved_at") else 0,
    )


def _doc_to_cluster(c: dict) -> issue_pb2.Cluster:
    lat = c.get("lat")
    lon = c.get("lon")
    # Join top addresses as readable location name
    addrs = c.get("addresses", [])
    address = addrs[0] if addrs else f"Cluster {c.get('cluster_id', '?')}"
    return issue_pb2.Cluster(
        address=address,
        lat=float(lat) if lat is not None else 0.0,
        lon=float(lon) if lon is not None else 0.0,
        issue_count=int(c.get("issue_count", 0)),
        types=list(c.get("types", [])),
    )


class IssueServicer(service_pb2_grpc.IssueServiceServicer):
    def __init__(self, repo: IssueRepository, publisher: EventPublisher):
        self.repo = repo
        self.publisher = publisher

    def ListIssues(self, request, context):
        p = request.pagination
        items, total = self.repo.list_issues(
            status=request.status, type_filter=request.type, keyword=request.keyword,
            created_after=request.created_after,
            page=p.page if p else 1, per_page=p.per_page if p else 20,
        )
        return service_pb2.ListIssuesResponse(
            issues=[_doc_to_issue(i) for i in items],
            pagination=common_pb2.PaginationResponse(
                page=p.page if p else 1, per_page=p.per_page if p else 20, total=total,
            ),
        )

    def GetIssue(self, request, context):
        doc = self.repo.get_issue(request.id)
        if not doc:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"Issue '{request.id}' not found")
            return service_pb2.GetIssueResponse()
        return service_pb2.GetIssueResponse(issue=_doc_to_issue(doc))

    def ResolveIssue(self, request, context):
        doc = self.repo.get_issue(request.issue_id)
        if not doc:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"Issue '{request.issue_id}' not found")
            return service_pb2.ResolveIssueResponse(success=False, message="Issue not found")

        self.repo.issues.update_one(
            {"_id": request.issue_id},
            {"$set": {
                "status": "resolved",
                "resolution": {
                    "admin_id": request.admin_id,
                    "notes": request.notes,
                    "image_hashes": list(request.image_hashes),
                    "resolved_at": int(time.time()),
                },
                "resolved_at": int(time.time()),
            }},
        )
        # ponytail: publish event + blockchain record
        tweet_id = doc.get("tweet_id", "")
        self.publisher.publish_issue_resolved(
            issue_id=request.issue_id,
            tweet_id=tweet_id,
            admin_id=request.admin_id,
            notes=request.notes,
            image_hashes=list(request.image_hashes),
            resolved_at=int(time.time()),
        )
        return service_pb2.ResolveIssueResponse(success=True, message="Issue resolved")

    def ListClusters(self, request, context):
        clusters = self.repo.list_clusters()
        return service_pb2.ListClustersResponse(
            clusters=[_doc_to_cluster(c) for c in clusters],
        )

    def GetWordCloud(self, request, context):
        items = self.repo.get_word_cloud()
        return service_pb2.GetWordCloudResponse(
            items=[service_pb2.WordCloudItem(word=it["word"], count=int(it["count"])) for it in items],
        )


if __name__ == "__main__":
    cfg = Config()
    repo = IssueRepository(
        mongo_uri=cfg.MONGODB_URI,
        eps_km=cfg.CLUSTER_EPS_KM,
        min_samples=cfg.CLUSTER_MIN_PTS,
    )
    publisher = EventPublisher(rabbitmq_uri=cfg.RABBITMQ_URI)
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_IssueServiceServicer_to_server(IssueServicer(repo, publisher), server)
    dashboard_service_pb2_grpc.add_DashboardServiceServicer_to_server(DashboardServicer(repo), server)
    server.add_insecure_port(f"0.0.0.0:{cfg.GRPC_PORT}")
    print(f"✅ IssueService gRPC on port {cfg.GRPC_PORT}")
    server.wait_for_termination()
