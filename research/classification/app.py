import json
import os
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import onnxruntime as ort

app = Flask(__name__)

# ponytail: Singleton pattern to hold the model instance and labels in memory
class ModelService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.model_path = "output/model.onnx"
        self.labels_path = "output/labels.json"
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.labels_path):
            raise FileNotFoundError("Model or labels not found. Run training/export first.")

        # Load labels
        with open(self.labels_path, "r") as f:
            self.labels = json.load(f)

        # Load ONNX session
        self.session = ort.InferenceSession(self.model_path)
        self.input_name = self.session.get_inputs()[0].name

    def predict(self, image: Image.Image):
        # Preprocess: Resize to 224x224, convert to RGB, and normalize
        image = image.convert("RGB").resize((224, 224))
        img_data = np.array(image).astype(np.float32) / 255.0
        
        # Normalize (mean and std for ImageNet)
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_data = (img_data - mean) / std
        
        # HWC to CHW and add Batch dimension
        img_data = np.transpose(img_data, (2, 0, 1))
        img_data = np.expand_dims(img_data, axis=0)

        # Run ONNX inference
        outputs = self.session.run(None, {self.input_name: img_data})
        logits = outputs[0][0]

        # Softmax to get confidences
        exp_logits = np.exp(logits - np.max(logits))
        confidences = exp_logits / np.sum(exp_logits)
        
        idx = int(np.argmax(confidences))
        return self.labels[idx], float(confidences[idx])


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image field provided"}), 400
    
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        image = Image.open(file.stream)
        service = ModelService.get_instance()
        label, confidence = service.predict(image)
        return jsonify({"prediction": label, "confidence": confidence})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
