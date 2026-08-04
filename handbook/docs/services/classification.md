# Classification Service

Image classification using **ONNX Runtime**. This service processes images and returns predicted labels with confidence scores.

## Tech Stack

- **Python** (Flask + grpcio)
- **ONNX Runtime** — model inference
- **Pillow** — image preprocessing

## Files

```
backend/classification-service/
├── features/classifier/
│   ├── infer.py            # ONNX inference engine
│   └── service.py          # Classification logic
├── models/
│   ├── model.onnx          # Trained model
│   └── labels.json         # Labels
├── server.py               # Entry point (gRPC + Flask)
```

## Ports

| Port | Protocol | Function |
|------|----------|----------|
| 50053 | gRPC | `ClassifyImage` |
| 8083 | HTTP | `/classify`, `/health` |

## Proto

```protobuf
service ClassificationService {
  rpc ClassifyImage (ClassifyImageRequest) returns (ClassifyImageResponse);
  rpc ClassifyImages (ClassifyImagesRequest) returns (ClassifyImagesResponse);
}
```

### Single Image (ClassifyImage)

Takes one image, returns label + confidence.

### Multiple Images (ClassifyImages) — NEW

Classifies **multiple images** at once, aggregates via **majority vote**:

```protobuf
message ClassifyImagesRequest {
  repeated ImageData images = 1;  // send 1-N images
  string tweet_id = 2;
}

message ClassifyImagesResponse {
  ClassificationResult result = 1;  // aggregated majority label
  repeated ImageResult individual = 2;  // per-image breakdown
}
```

**Aggregation logic**:
1. Each image gets classified individually
2. Label with the most votes (majority) wins
3. Tie-break: pick label with highest individual confidence
4. Final confidence: highest confidence among winning-label predictions

**Example**: 3 images → flood, road_damage, flood → **flood** (2/3)

## REST Endpoints

| Method | Path | Function |
|--------|------|----------|
| POST | `/classify` | Single image (file field: `image`) |
| POST | `/classify-multi` | Multiple images (files field: `images[]`) |
| GET | `/health` | Health check |

## Key: Inference

```python
class ONNXInferenceEngine:
    def __init__(self, model_path, labels_path):
        self.session = onnxruntime.InferenceSession(model_path)
        self.labels = json.load(open(labels_path))

    def predict(self, input_tensor):
        return self.session.run(None, feed)[0][0].tolist()
```

## Key: Preprocessing

```python
def _preprocess(self, image_data):
    img = Image.open(io.BytesIO(image_data))
    img = img.convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = (arr - mean) / std
    return arr.transpose((2, 0, 1))[None, ...]  # → NCHW
```

## Labels

```json
["fallen_tree", "garbage", "vandalism", "road_damage", "flood"]
```

## Run

```bash
python server.py
# gRPC :50053 + HTTP :8083
```

## Test

```bash
curl -X POST -F "image=@photo.jpg" http://localhost:8083/classify
```

## Tests

| File | Coverage |
|------|----------|
| `tests/test_infer.py` | ONNX engine (mock predict, labels, model missing) |
| `tests/test_service.py` | Preprocessing (NCHW shape, float32), classify (keys, sorting) |
| `tests/test_multi_image.py` | Majority vote, tie-break, empty input, individual breakdown |

