"""Self-check untuk text preprocessing & paraphrase fallback (tanpa model).

Jalankan: python -m tests.check_preprocess  (dari backend/nlp-service)
atau:     python tests/check_preprocess.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.preprocess import service as pp  # noqa: E402
from features.classifier import service as clf  # noqa: E402
from features.paraphrase import service as para  # noqa: E402

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


# ─── data cleaning ───
out = pp.clean_text("@mnatori26 #LaporinAja ada pohon tumbang di jalan raya! 123")
check("cleaning hapus mention", "@" not in out and "mnatori26" not in out)
check("cleaning hapus tagar", "#" not in out and "LaporinAja" not in out)
check("cleaning hapus angka & tanda baca", "123" not in out and "!" not in out)

out = pp.clean_text("lihat https://x.com/a sampah menumpuk di pasar")
check("cleaning hapus URL", "http" not in out and "x.com" not in out)

# ─── case folding ───
check("case fold lowercase", pp.case_fold("POHON Tumbang") == "pohon tumbang")

# ─── tokenize + stopword ───
tokens = pp.tokenize("pohon tumbang di jalan raya")
check("tokenize pecah kata", tokens == ["pohon", "tumbang", "di", "jalan", "raya"])

tokens = pp.remove_stopwords(["pohon", "tumbang", "di", "jalan", "raya"])
check("stopword hapus 'di'", "di" not in tokens and "pohon" in tokens)

# ─── preprocess end-to-end ───
pre = pp.preprocess("@mnatori26 #LaporinAja POHON tumbang di jalan raya")
check("preprocess text bersih", pre["text"] == "pohon tumbang jalan raya")
check("preprocess tokens", pre["tokens"] == ["pohon", "tumbang", "jalan", "raya"])

# ─── paraphrase fallback (tanpa model) ───
# Pastikan fallback template jalan dan tidak berisi mention/tagar asli.
p = para._template_fallback("fallen_tree", "Bekasi")
check("paraphrase template fallen_tree", "pohon tumbang" in p and "Bekasi" in p)
check("paraphrase tidak bocor mention", "@" not in p)

p2 = para.paraphrase("", "garbage", "")
check("paraphrase teks kosong -> fallback", "sampah" in p2 or "lokasi" in p2)

# ─── classifier 5 kategori ───
check("classifier fallen_tree", clf.classify("pohon tumbang")[0] == "fallen_tree")
check("classifier garbage", clf.classify("sampah menumpuk")[0] == "garbage")
check("classifier flood", clf.classify("banjir bandang")[0] == "flood")
check("classifier road_damage", clf.classify("jalan berlubang")[0] == "road_damage")
check("classifier vandalism", clf.classify("coretan grafiti")[0] == "vandalism")

print(f"\n{pass_count} passed, {fail_count} failed")
sys.exit(1 if fail_count else 0)
