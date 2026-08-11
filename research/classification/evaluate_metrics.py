"""Fungsi murni evaluasi klasifikasi: confusion matrix + metrics.

Tanpa dependensi onnxruntime, sehingga bisa diuji terpisah (unit test).
"""

import numpy as np


def confusion_matrix(y_true, y_pred, n_classes):
    cm = np.zeros((n_classes, n_classes), dtype=int)
    for t, p in zip(y_true, y_pred):
        cm[t, p] += 1
    return cm


def metrics(cm):
    """Accuracy, Precision, Recall, F1 (macro) dari confusion matrix."""
    n = cm.sum()
    acc = float(np.trace(cm)) / n if n else 0.0

    tp = np.diag(cm)
    fp = cm.sum(axis=0) - tp
    fn = cm.sum(axis=1) - tp

    precision = tp / (tp + fp).clip(min=1)
    recall = tp / (tp + fn).clip(min=1)
    f1 = 2 * precision * recall / (precision + recall).clip(min=1e-9)

    return {
        "accuracy": acc,
        "precision": float(np.mean(precision)),
        "recall": float(np.mean(recall)),
        "f1": float(np.mean(f1)),
        "per_class": {
            "precision": precision.tolist(),
            "recall": recall.tolist(),
            "f1": f1.tolist(),
        },
    }
