"""
DBSCAN clustering engine — pure Python, no dependencies beyond math.
Analogous to ONNXInferenceEngine in classification-service.
"""

import math


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in km between two coordinates."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class DBSCANEngine:
    """Density-Based Spatial Clustering of Applications with Noise.

    Args:
        eps_km: Maximum distance (km) for neighborhood.
        min_samples: Minimum points to form a cluster.
    """

    def __init__(self, eps_km: float = 7.0, min_samples: int = 3):
        self.eps_km = eps_km
        self.min_samples = min_samples

    def fit_predict(self, points: list[tuple[float, float]]) -> list[int]:
        """Run DBSCAN, return cluster labels (-1 = noise)."""
        n = len(points)
        if n == 0:
            return []

        # Distance matrix
        dist = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(i + 1, n):
                d = haversine_km(points[i][0], points[i][1], points[j][0], points[j][1])
                dist[i][j] = dist[j][i] = d

        # Neighbors per point
        neighbors = []
        for i in range(n):
            nbrs = [j for j in range(n) if j != i and dist[i][j] <= self.eps_km]
            neighbors.append(nbrs)

        labels = [-2] * n  # -2 = unvisited
        cluster_id = 0

        for i in range(n):
            if labels[i] != -2:
                continue
            if len(neighbors[i]) < self.min_samples - 1:
                labels[i] = -1
                continue

            labels[i] = cluster_id
            seed = neighbors[i][:]

            while seed:
                q = seed.pop()
                if labels[q] == -1:
                    labels[q] = cluster_id
                if labels[q] != -2:
                    continue
                labels[q] = cluster_id
                if len(neighbors[q]) >= self.min_samples - 1:
                    seed.extend(neighbors[q])
            cluster_id += 1

        return labels

    def silhouette_score(self, points: list[tuple[float, float]], labels: list[int]) -> float:
        """Compute Silhouette Score manually."""
        n = len(points)
        if n < 2:
            return 0.0
        unique = set(labels)

        dist = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(i + 1, n):
                d = haversine_km(points[i][0], points[i][1], points[j][0], points[j][1])
                dist[i][j] = dist[j][i] = d

        scores = []
        for i in range(n):
            same = [j for j in range(n) if labels[j] == labels[i] and j != i]
            if not same:
                continue
            a = sum(dist[i][j] for j in same) / len(same)
            b = float("inf")
            for lbl in unique:
                if lbl == labels[i] or lbl == -1:
                    continue
                other = [j for j in range(n) if labels[j] == lbl]
                if not other:
                    continue
                mean_d = sum(dist[i][j] for j in other) / len(other)
                b = min(b, mean_d)
            if b != float("inf"):
                scores.append((b - a) / max(a, b))

        return sum(scores) / len(scores) if scores else 0.0
