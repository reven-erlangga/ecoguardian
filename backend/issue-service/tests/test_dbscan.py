"""
Tests for DBSCAN clustering implementation.
"""

import sys
import math
from pathlib import Path

import pytest

_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

from features.clustering import DBSCANEngine, haversine_km
from features.clustering.service import ClusteringService


class TestHaversine:

    def test_known_distance(self):
        # Jakarta → Bandung ~120 km
        d = haversine_km(-6.2, 106.8, -6.92, 107.61)
        assert 110 < d < 130, f"Expected ~120 km, got {d}"

    def test_same_point_zero(self):
        d = haversine_km(-6.2, 106.8, -6.2, 106.8)
        assert d == 0.0

    def test_far_distance(self):
        # Jakarta → Tokyo ~5,800 km
        d = haversine_km(-6.2, 106.8, 35.68, 139.76)
        assert 5500 < d < 6000, f"Expected ~5800 km, got {d}"


class TestDBSCAN:

    def test_empty_input(self):
        db = DBSCANEngine()
        assert db.fit_predict([]) == []

    def test_single_point_noise(self):
        db = DBSCANEngine(eps_km=1.0, min_samples=2)
        labels = db.fit_predict([(-6.2, 106.8)])
        assert labels == [-1]

    def test_two_close_points_noise_if_minpts_3(self):
        db = DBSCANEngine(eps_km=10.0, min_samples=3)
        labels = db.fit_predict([(-6.2, 106.8), (-6.21, 106.81)])
        assert labels == [-1, -1]

    def test_three_close_points_form_cluster(self):
        db = DBSCANEngine(eps_km=10.0, min_samples=3)
        labels = db.fit_predict([
            (-6.2, 106.8), (-6.21, 106.81), (-6.19, 106.79),
        ])
        assert labels == [0, 0, 0]

    def test_far_point_is_noise(self):
        db = DBSCANEngine(eps_km=10.0, min_samples=2)
        labels = db.fit_predict([
            (-6.2, 106.8), (-6.21, 106.81), (-7.25, 112.74),
        ])
        assert labels[0] == 0
        assert labels[1] == 0
        assert labels[2] == -1

    def test_two_separate_clusters(self):
        db = DBSCANEngine(eps_km=10.0, min_samples=2)
        labels = db.fit_predict([
            (-6.2, 106.8), (-6.21, 106.81),
            (-6.92, 107.61), (-6.93, 107.62),
        ])
        assert labels[0] == labels[1]
        assert labels[2] == labels[3]
        assert labels[0] != labels[2]


class TestClusteringService:

    def test_cluster_from_db_adds_ids(self):
        svc = ClusteringService(eps_km=10.0, min_samples=2)
        issues = [
            {"location": {"lat": -6.2, "lon": 106.8}, "type": "garbage"},
            {"location": {"lat": -6.21, "lon": 106.81}, "type": "flood"},
        ]
        result = svc.cluster_from_db(issues)
        assert len(result) == 1
        assert result[0]["issue_count"] == 2

    def test_skip_no_location(self):
        svc = ClusteringService(eps_km=10.0, min_samples=2)
        issues = [
            {"type": "garbage"},
            {"location": {"lat": -6.2, "lon": 106.8}, "type": "flood"},
            {"location": {"lat": -6.21, "lon": 106.81}, "type": "garbage"},
        ]
        result = svc.cluster_from_db(issues)
        assert len(result) == 1
        assert result[0]["issue_count"] == 2

    def test_empty_input(self):
        svc = ClusteringService()
        assert svc.cluster_from_db([]) == []
