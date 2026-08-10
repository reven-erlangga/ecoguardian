"""Setup HTTP API — konfigurasi clustering (eps/min_pts).

Setting disimpan di collection 'settings' MongoDB dan dibaca runtime oleh
IssueRepository.list_clusters(), sehingga perubahan langsung berlaku tanpa
restart service.
"""

from flask import Flask, jsonify, request


def build_setup_app(repo):
    app = Flask(__name__)

    @app.after_request
    def add_cors(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return response

    @app.get("/setup/clustering")
    def get_clustering():
        return jsonify(repo.get_clustering_settings())

    @app.post("/setup/clustering")
    def save_clustering():
        body = request.get_json(silent=True) or {}
        try:
            eps_km = float(body["eps_km"])
            min_pts = int(body["min_pts"])
        except (KeyError, TypeError, ValueError):
            return jsonify({"error": "'eps_km' dan 'min_pts' wajib berupa angka"}), 400
        if eps_km <= 0 or min_pts < 1:
            return jsonify({"error": "'eps_km' harus > 0 dan 'min_pts' >= 1"}), 400
        return jsonify(repo.save_clustering_settings(eps_km, min_pts))

    return app
