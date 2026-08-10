"""Check runnable untuk endpoint /cluster."""

import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_cluster_separates_two_blobs_and_noise(client):
    # Dua blob terpisah + 1 titik jauh → harus jadi 2 cluster + 1 noise.
    points = [
        [0, 0], [0.1, 0], [0, 0.1],   # blob A
        [10, 10], [10.1, 10],         # blob B
        [50, 50],                     # noise
    ]
    resp = client.post("/cluster", json={"points": points, "eps": 1.0, "min_samples": 2})
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["n_clusters"] == 2
    assert body["n_noise"] == 1
    assert body["labels"] == [0, 0, 0, 1, 1, -1]


def test_accepts_dict_points(client):
    points = [{"x": 0, "y": 0}, {"x": 0.2, "y": 0}, {"x": 5, "y": 5}]
    resp = client.post("/cluster", json={"points": points, "eps": 0.5, "min_samples": 2})
    assert resp.status_code == 200
    assert resp.get_json()["n_clusters"] == 1
    assert resp.get_json()["n_noise"] == 1


def test_missing_eps_is_400(client):
    resp = client.post("/cluster", json={"points": [[0, 0]]})
    assert resp.status_code == 400


def test_invalid_point_is_400(client):
    resp = client.post("/cluster", json={"points": [[0, 0], "bukan-titik"], "eps": 1})
    assert resp.status_code == 400


def test_non_numeric_eps_is_400(client):
    resp = client.post("/cluster", json={"points": [[0, 0]], "eps": "abc"})
    assert resp.status_code == 400


def test_negative_eps_is_400(client):
    resp = client.post("/cluster", json={"points": [[0, 0]], "eps": -1})
    assert resp.status_code == 400


def test_invalid_metric_is_400(client):
    resp = client.post("/cluster", json={"points": [[0, 0]], "eps": 1, "metric": "banana"})
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# POST /optimize — grid search eps x min_samples
# ---------------------------------------------------------------------------

BLOBS_AND_NOISE = [
    [0, 0], [0.1, 0], [0, 0.1],   # blob A
    [10, 10], [10.1, 10],         # blob B
    [50, 50],                     # noise
]


def test_optimize_finds_best_params_and_noise(client):
    resp = client.post(
        "/optimize",
        json={
            "points": BLOBS_AND_NOISE,
            "eps_values": [0.3, 0.5, 1.0, 2.0],
            "min_samples_values": [2, 3, 5],
        },
    )
    assert resp.status_code == 200
    body = resp.get_json()

    # Kombinasi optimal harus memisah 2 blob dan menandai 1 noise.
    assert body["best"]["n_clusters"] == 2
    assert body["best"]["n_noise"] == 1
    assert body["best"]["score"] > 0

    # Label & index noise ikut dikembalikan (index 5 = titik [50, 50]).
    assert body["labels"] == [0, 0, 0, 1, 1, -1]
    assert body["noise"] == [5]
    assert body["n_points"] == 6
    assert body["grid_size"] == 4 * 3


def test_optimize_with_eps_range(client):
    resp = client.post(
        "/optimize",
        json={
            "points": BLOBS_AND_NOISE,
            "eps_min": 0.1,
            "eps_max": 2.0,
            "eps_steps": 5,
            "min_samples_min": 2,
            "min_samples_max": 4,
        },
    )
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["grid_size"] == 5 * 3
    assert body["best"]["n_noise"] >= 1


def test_optimize_results_sorted_by_score(client):
    resp = client.post(
        "/optimize",
        json={
            "points": BLOBS_AND_NOISE,
            "eps_values": [0.3, 1.0, 2.0],
            "min_samples_values": [2, 4],
        },
    )
    assert resp.status_code == 200
    body = resp.get_json()
    scores = [row["score"] for row in body["results"]]
    assert scores == sorted(scores, reverse=True)
    assert body["results"][0]["eps"] == body["best"]["eps"]
    assert body["results"][0]["min_samples"] == body["best"]["min_samples"]


def test_optimize_requires_points(client):
    resp = client.post("/optimize", json={"eps_values": [1.0]})
    assert resp.status_code == 400


def test_optimize_requires_eps(client):
    resp = client.post("/optimize", json={"points": [[0, 0]]})
    assert resp.status_code == 400


def test_optimize_negative_eps_is_400(client):
    resp = client.post(
        "/optimize", json={"points": [[0, 0]], "eps_values": [0.5, -1.0]}
    )
    assert resp.status_code == 400
