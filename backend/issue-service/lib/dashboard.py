"""Dashboard aggregation — issue counts, recent activity, etc."""

import grpc

from dashboard import dashboard_pb2, service_pb2_grpc
from lib.db import IssueRepository


class DashboardServicer(service_pb2_grpc.DashboardServiceServicer):
    def __init__(self, repo: IssueRepository):
        self.repo = repo

    def GetStats(self, request, context):
        try:
            total_issues = self.repo.get_total_issues()
            open_issues = self.repo.get_open_issues()
            resolved_issues = self.repo.get_resolved_issues()
            issues_by_type = self.repo.get_issues_by_type()
            recent_issues = self.repo.get_recent_issues(limit=5)
            recent_tweets = self.repo.get_recent_tweets(limit=5)
            total_tweets = self.repo.get_total_tweets()

            stats = dashboard_pb2.DashboardStats(
                total_tweets=total_tweets,
                total_issues=total_issues,
                open_issues=open_issues,
                resolved_issues=resolved_issues,
                unread_notifications=0,  # panggil notification service via gRPC di layer lain
                blockchain_blocks=0,  # panggil blockchain service via gRPC di layer lain
                blockchain_verified=False,
            )

            for k, v in issues_by_type.items():
                stats.issues_by_type[k] = v

            for tw in recent_tweets:
                rt = stats.recent_tweets.add()
                rt.id = str(tw.get("_id", tw.get("id", "")))
                rt.tweet_id = tw.get("tweet_id", "")
                rt.text = tw.get("paraphrased_text") or tw.get("text", "")
                rt.author_username = tw.get("author_username", "")
                rt.created_at = int(tw.get("created_at", 0))
                cls = tw.get("classification", {}) or {}
                rt.classification_label = (cls.get("text", {}) or {}).get("label", "")

            for iss in recent_issues:
                ri = stats.recent_issues.add()
                ri.id = str(iss.get("_id", iss.get("id", "")))
                ri.type = iss.get("type", "")
                ri.status = iss.get("status", "open")
                loc = iss.get("location", {}) or {}
                ri.address = loc.get("address", "")
                ri.created_at = int(iss.get("created_at", 0))

            return stats
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Dashboard error: {e}")
            return dashboard_pb2.DashboardStats()