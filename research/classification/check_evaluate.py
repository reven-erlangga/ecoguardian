"""Self-check untuk fungsi evaluasi model (confusion matrix + metrics).

Menjalankan metrik dengan data sintetis tanpa perlu model ONNX.

Jalankan: python check_evaluate.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from evaluate_metrics import confusion_matrix, metrics

pass_count = 0
fail_count = 0


def check(name, cond):
    global pass_count, fail_count
    if cond:
        pass_count += 1
        print(f"✓ {name}")
    else:
        fail_count += 1
        print(f"✗ {name}")


# Skenario sempurna: semua prediksi benar (3 kelas)
y_true = np.array([0, 0, 1, 1, 2, 2])
y_pred = np.array([0, 0, 1, 1, 2, 2])
cm = confusion_matrix(y_true, y_pred, 3)
m = metrics(cm)
check("akurasi sempurna = 1.0", abs(m["accuracy"] - 1.0) < 1e-9)
check("precision sempurna = 1.0", abs(m["precision"] - 1.0) < 1e-9)
check("recall sempurna = 1.0", abs(m["recall"] - 1.0) < 1e-9)
check("f1 sempurna = 1.0", abs(m["f1"] - 1.0) < 1e-9)

# Skenario 2 kelas, 1 salah prediksi
# y_true = [0,0,1,1], y_pred = [0,1,1,1]
# CM: [[1,1],[0,2]]
# TP=[1,2], FP=[0,1], FN=[1,0]
# precision=[1.0, 2/3]  -> macro 0.8333
# recall=[1/2, 1.0]     -> macro 0.75
# f1=[(2/3),(4/5)]      -> macro (0.667+0.8)/2 = 0.7333
y_true = np.array([0, 0, 1, 1])
y_pred = np.array([0, 1, 1, 1])
cm = confusion_matrix(y_true, y_pred, 2)
check("cm[0][0]=1", cm[0][0] == 1)
check("cm[1][1]=2", cm[1][1] == 2)
m = metrics(cm)
check("accuracy=0.75", abs(m["accuracy"] - 0.75) < 1e-9)
check("precision macro=0.8333", abs(m["precision"] - 0.8333) < 1e-3)
check("recall macro=0.75", abs(m["recall"] - 0.75) < 1e-9)
check("f1 macro=0.7333", abs(m["f1"] - 0.7333) < 1e-3)

# Diagonal confusion matrix shape
check("cm ukuran 5x5", confusion_matrix(np.array([0, 4]), np.array([0, 4]), 5).shape == (5, 5))

print(f"\n{pass_count} passed, {fail_count} failed")
sys.exit(1 if fail_count else 0)
