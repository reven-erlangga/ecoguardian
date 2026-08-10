"""Retrain pipeline — kumpulkan data -> split train/val -> train.py -> ONNX -> reload.

Alur:
1. Terima sampel {label, url} (URL gambar, mis. dari ImageKit via asset-service)
   lalu unduh ke `training-data/<label>/`.
2. Gambar yang sudah terkumpul (termasuk auto-save dari klasifikasi) di-split
   80/20 menjadi `retrain-data/train|val/<label>/`.
3. Jalankan `train.py` (EfficientNet-B0 -> ONNX) sebagai subproses.
4. Jika berhasil, engine inference di-reload sehingga model baru langsung aktif.

Retrain berjalan async (thread) — status dipantau via /setup/retrain/status.
Membutuhkan torch + torchvision di environment Python yang menjalankan train.py.
"""

import hashlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

TRAIN_SCRIPT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "train.py")

# Nama folder label aman: huruf/angka/underscore/dash/spasi — tanpa '..', tanpa path separator.
_SAFE_LABEL = re.compile(r"[^A-Za-z0-9_\- ]+")


def _safe_label(label: str) -> str:
    """Sanitasi label jadi nama folder yang aman (cegah path traversal)."""
    clean = _SAFE_LABEL.sub("_", label.strip())
    clean = clean.strip("._ ")
    if not clean:
        clean = "unknown"
    return clean

TRAIN_SCRIPT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "train.py")


def _torch_available() -> bool:
    return importlib.util.find_spec("torch") is not None


class RetrainManager:
    """Manager job training ulang (satu job berjalan pada satu waktu)."""

    def __init__(self, data_root, model_path, labels_path, engine, python=None):
        self.data_root = Path(data_root)
        self.retrain_root = self.data_root.parent / "retrain-data"
        self.model_path = Path(model_path)
        self.labels_path = Path(labels_path)
        self.engine = engine
        self.python = python or sys.executable
        self._lock = threading.Lock()
        self._job = self._idle_job()

    @staticmethod
    def _idle_job() -> dict:
        return {
            "status": "idle",
            "started_at": None,
            "finished_at": None,
            "error": None,
            "samples_downloaded": 0,
            "total_images": 0,
            "epochs": 0,
            "batch_size": 0,
            "accuracy": None,
        }

    def status(self) -> dict:
        with self._lock:
            return dict(self._job)

    def start(self, epochs: int = 20, batch_size: int = 32, samples: list | None = None):
        """Mulai retrain. `samples` = [{"label": str, "url": str}, ...]."""
        if not _torch_available():
            return {
                "error": (
                    "torch tidak terpasang di environment service. "
                    "Jalankan retrain dari environment dengan torch (mis. "
                    "research/training/.venv-train) atau install torch."
                )
            }, 400
        epochs = max(1, int(epochs))
        batch_size = max(1, int(batch_size))
        samples = samples or []

        with self._lock:
            if self._job["status"] == "running":
                return {"error": "retrain sedang berjalan"}, 409
            self._job = {
                **self._idle_job(),
                "status": "running",
                "started_at": int(time.time()),
                "epochs": epochs,
                "batch_size": batch_size,
            }

        thread = threading.Thread(
            target=self._run, args=(epochs, batch_size, samples), daemon=True
        )
        thread.start()
        return {"status": "running", "job": self.status()}, 200

    # ─── internals ────────────────────────────────────────

    def _run(self, epochs: int, batch_size: int, samples: list):
        try:
            downloaded = self._download_samples(samples)
            total_images = sum(
                len(list(d.glob("*"))) for d in self.data_root.iterdir()
                if d.is_dir() and any(d.iterdir())
            ) if self.data_root.exists() else 0
            self._set_job(samples_downloaded=downloaded, total_images=total_images)

            train_root, val_root = self._split_dataset()
            if not train_root.exists():
                raise RuntimeError("tidak ada data training yang valid")

            cmd = [
                self.python, TRAIN_SCRIPT,
                "--data", str(self.retrain_root),
                "--epochs", str(epochs),
                "--batch", str(batch_size),
                "--output", str(self.model_path),
                "--labels", str(self.labels_path),
            ]
            proc = subprocess.run(
                cmd, capture_output=True, text=True, timeout=60 * 60
            )
            out = (proc.stdout or "") + (proc.stderr or "")
            accuracy = self._parse_accuracy(proc.stdout or "")
            if proc.returncode != 0:
                tail = "\n".join((proc.stderr or proc.stdout or "").splitlines()[-15:])
                raise RuntimeError(f"train.py gagal (rc={proc.returncode}):\n{tail}")

            self.engine.reload()
            self._set_job(
                status="done", finished_at=int(time.time()),
                accuracy=accuracy, error=None,
            )
        except Exception as exc:
            self._set_job(status="error", finished_at=int(time.time()), error=str(exc))

    def _download_samples(self, samples: list) -> int:
        count = 0
        for sample in samples:
            label = _safe_label(sample.get("label") or "unknown")
            url = (sample.get("url") or "").strip()
            if not url:
                continue
            # Hanya http/https — cegah file:// dan skema lain (keamanan).
            if not url.lower().startswith(("http://", "https://")):
                print(f"⚠️  Skipped URL non-http: {url}")
                continue
            label_dir = self.data_root / label
            label_dir.mkdir(parents=True, exist_ok=True)
            try:
                name = url.rsplit("/", 1)[-1].split("?")[0] or "img"
                name = _safe_label(name) or "img"
                if "." not in name:
                    name += ".jpg"
                # Uniquify: 2 URL beda dgn basename sama → jangan saling timpa.
                digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:8]
                stem, _, ext = name.rpartition(".")
                name = f"{stem}_{digest}.{ext}"
                target = label_dir / name
                if target.exists():
                    count += 1
                    continue
                req = urllib.request.Request(
                    url, headers={"User-Agent": "ecoguard-classification/1.0"}
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = resp.read()
                if not data:
                    continue
                target.write_bytes(data)
                count += 1
            except Exception as exc:
                print(f"⚠️  Gagal unduh {url}: {exc}")
        return count

    def _split_dataset(self, val_ratio: float = 0.2):
        """Split training-data/<label>/* -> retrain-data/train|val/<label>/ (80/20)."""
        if self.retrain_root.exists():
            shutil.rmtree(self.retrain_root)
        train_root = self.retrain_root / "train"
        val_root = self.retrain_root / "val"

        labels = [
            d.name for d in self.data_root.iterdir()
            if d.is_dir() and any(d.iterdir())
        ]
        for label in labels:
            files = sorted(self.data_root.glob(f"{label}/*"))
            n_val = max(1, int(len(files) * val_ratio))
            val_files, train_files = files[:n_val], files[n_val:]

            for subset, subset_files in ((val_root, val_files), (train_root, train_files)):
                dest = subset / label
                dest.mkdir(parents=True, exist_ok=True)
                for f in subset_files:
                    shutil.copy2(f, dest / f.name)
        return train_root, val_root

    @staticmethod
    def _parse_accuracy(stdout: str):
        for line in stdout.splitlines():
            if "Best accuracy" in line:
                try:
                    return float(line.split(":")[-1].replace("%", "").strip())
                except ValueError:
                    return None
        return None

    def _set_job(self, **updates):
        with self._lock:
            self._job.update(updates)
