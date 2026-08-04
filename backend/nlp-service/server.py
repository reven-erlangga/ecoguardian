"""
NLP Service — gRPC server

Provides:
  - AnalyzeText: classify → NER → paraphrase, returns all results
  - Geocode:     resolve address → (lat, lon) via Nominatim
"""

import os
import sys
from concurrent import futures

import grpc

service_dir = os.path.dirname(os.path.abspath(__file__))
# ponytail: insert proto first — namespace package handles common/
sys.path.insert(0, os.path.join(service_dir, "proto"))

from nlp import nlp_pb2, service_pb2, service_pb2_grpc

from common.config import Config
from common.grpc_server import serve
from features.classifier import service as classifier_service
from features.ner import service as ner_service
from features.paraphrase import service as paraphrase_service
from features.reply import service as reply_service
from geocoding.cache import GeoCache
from geocoding.nominatim import NominatimClient

# ─── Global Nominatim client with Redis cache ───────────────

_cache = GeoCache(Config.REDIS_URL)
_nominatim = NominatimClient(
    base_url=Config.NOMINATIM_BASE_URL,
    user_agent=Config.NOMINATIM_USER_AGENT,
    cache=_cache,
)


class NLPServiceServicer(service_pb2_grpc.NLPServiceServicer):
    """gRPC servicer implementing NLPService."""

    def AnalyzeText(self, request, context):
        text = request.text

        # 1. Classify
        label, confidence = classifier_service.classify(text)

        # 2. NER — extract address
        address = ner_service.extract_address(text)

        # 3. Paraphrase — never includes original text
        paraphrased = paraphrase_service.paraphrase(text, label, address)

        return nlp_pb2.AnalyzeTextResponse(
            label=label,
            confidence=confidence,
            extracted_address=address,
            paraphrased_text=paraphrased,
        )

    def Geocode(self, request, context):
        result = _nominatim.geocode(request.address)
        if result:
            return nlp_pb2.GeocodeResponse(
                lat=result["lat"],
                lon=result["lon"],
                display_name=result["display_name"],
            )
        # Address not found — return zero coordinates
        return nlp_pb2.GeocodeResponse(lat=0.0, lon=0.0, display_name="")

    def GenerateReply(self, request, context):
        msg = reply_service.generate_reply(
            tweet_text=request.tweet_text,
            missing_fields=list(request.missing_fields),
            classification_label=request.classification_label,
            classification_confidence=request.classification_confidence,
        )
        return nlp_pb2.GenerateReplyResponse(message=msg)


# ─── Main ───────────────────────────────────────────────────

if __name__ == "__main__":
    print("[NLP Service] Initialising features...")
    print(f"[NLP Service] Nominatim: {Config.NOMINATIM_BASE_URL}")

    print(f"[NLP Service] Starting gRPC server on port {Config.GRPC_PORT}...")
    serve(NLPServiceServicer, service_pb2_grpc.add_NLPServiceServicer_to_server)
