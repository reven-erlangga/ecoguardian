# Classification Service

Melakukan klasifikasi gambar menggunakan model **ONNX Runtime**. Service ini yang memproses gambar dan mengembalikan label + confidence.

## Tech Stack

- **Python** 3.12+
- **Flask** — HTTP health endpoint + REST classify
- **grpcio** — gRPC server
- **ONNX Runtime** — model inference
- **Pillow** — image preprocessing
- **pika** — RabbitMQ publisher (optional)

## Lokasi Kode

```
backend/classification-service/
├── common/
│   ├── config.py           # Environment config
│   └── grpc_server.py      # gRPC server helper
├── features/classifier/
│   ├── infer.py            # ONNX inference engine
│   └── service.py          # Classification business logic
├── models/
│   ├── model.onnx          # Trained ONNX model
│   └── labels.json         # Label mapping
├── protogen/               # Generated proto stubs
├── rabbitmq/publisher.py   # Event publisher
├── server.py               # Entry point (gRPC + Flask)
├── requirements.txt
└── Dockerfile
```

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50053 | gRPC | `ClassifyImage` RPC |
| 8083 | HTTP | Health + REST `/classify` |

## Proto Contract

```protobuf
service ClassificationService {
  rpc ClassifyImage(ClassifyImageRequest) returns (ClassifyImageResponse);
}

message ClassifyImageRequest {
  bytes image_data = 1;
  string image_format = 2;
  string tweet_id = 3;  // optional, untuk event tracing
}

message ClassifyImageResponse {
  ClassificationResult result = 1;
}

message ClassificationResult {
  string label = 1;
  float confidence = 2;
}
```

## Key Code: Inference Engine (`infer.py`)

```python
class ONNXInferenceEngine:
    def __init__(self, model_path, labels_path):
        self.session = onnxruntime.InferenceSession(model_path)
        self.labels = json.load(open(labels_path))

    def predict(self, input_tensor):
        feed = {self._input_name: input_tensor, **self._extra_feeds}
        return self.session.run(None, feed)[0][0].tolist()
```

Jika model ONNX tidak ditemukan, engine fallback ke **mock prediction** (random scores) — berguna untuk development tanpa model.

## Key Code: Preprocessing (`service.py`)

```python
def _preprocess(self, image_data, image_format):
    img = Image.open(io.BytesIO(image_data))
    img = img.convert("RGB").resize((224, 224))

    arr = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std  = np.array([0.229, 0.224, 0.225])
    arr = (arr - mean) / std

    return np.expand_dims(arr, axis=0)           # [1,224,224,3]
           .transpose((0, 3, 1, 2))              # [1,3,224,224] → NCHW
           .astype(np.float32)
```

## Key Code: Server (`server.py`)

```python
engine = ONNXInferenceEngine(
    model_path=cfg.MODEL_PATH,    # models/model.onnx
    labels_path=cfg.LABELS_PATH,  # models/labels.json
)
svc = ClassificationService(engine, publisher=publisher)

# gRPC
grpc server → GrpcServicer.ClassifyImage()
# HTTP (Flask)
@app.post("/classify") → svc.classify(file.read(), format)
```

## Labels

Default labels (setelah training dengan 5 dataset):

```json
["fallen_tree", "garbage", "vandalism", "road_damage", "flood"]
```

## Cara Running

### Development (langsung)

```bash
cd backend/classification-service
pip install -r requirements.txt
python server.py
```

### Docker

```bash
cd infra
docker compose up classification-service -d
```

## Test

```bash
# HTTP
curl -X POST -F "image=@foto.jpg" http://localhost:8083/classify

# Health
curl http://localhost:8083/health
```

## Event Publishing

Setelah klasifikasi selesai, service mempublish event ke RabbitMQ:

```
Exchange: ecoguard.events
Routing key: classification.completed
Payload: { tweet_id, label, confidence }
```
