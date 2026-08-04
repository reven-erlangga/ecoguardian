"""
Generate 5000 laporan dari data kecamatan Indonesia (real).
"""

import csv
import json
import random
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
KEC_PATH = Path(__file__).resolve().parent.parent / "collections" / "kecamatan.csv"

SUBJECTS = {
    "flood": [
        "Banjir", "Genangan air", "Luapan sungai", "Banjir bandang", "Air bah",
        "Banjir rob", "Banjir kiriman", "Genangan banjir", "Luapan air sungai", "Arus banjir",
    ],
    "garbage": [
        "Sampah", "Tumpukan sampah", "Limbah", "Sampah plastik", "Bau busuk sampah",
        "Sampah rumah tangga", "Limbah pasar", "Timbunan sampah", "Sampah organik", "Sampah anorganik",
    ],
    "fallen_tree": [
        "Pohon tumbang", "Pohon besar roboh", "Dahan patah", "Batang pohon", "Pohon ambruk",
        "Pohon tua tumbang", "Ranting pohon", "Pepohonan roboh", "Akasia tumbang", "Pohon kelapa tumbang",
    ],
    "vandalism": [
        "Vandalisme", "Coretan", "Aksi vandalisme", "Pengrusakan", "Graffiti",
        "Aksi corat-coret", "Perusakan", "Tindakan vandalisme", "Aksi perusakan", "Penggundulan",
    ],
    "road_damage": [
        "Jalan rusak", "Aspal hancur", "Jalan berlubang", "Jembatan retak", "Jalan ambles",
        "Jalan raya rusak", "Aspal mengelupas", "Badan jalan amblas", "Trotoar rusak", "Jalan desa rusak",
    ],
}

VERBS = {
    "flood": [
        "merendam", "menggenangi", "melanda", "menerjang", "menenggelamkan",
        "memporakporandakan", "menghanyutkan", "mengganggu", "merusak", "mengisolasi",
    ],
    "garbage": [
        "menumpuk di", "berserakan di", "memenuhi", "mencemari", "mengotori",
        "menyumbat", "mengganggu kenyamanan", "menimbulkan bau di", "mengapung di", "merusak pemandangan",
    ],
    "fallen_tree": [
        "menimpa", "merobohkan", "menutup", "merusak", "menghantam",
        "menghalangi", "memutus", "menjatuhi", "menekan", "menyebabkan kerusakan",
    ],
    "vandalism": [
        "merusak", "mencoret", "menghancurkan", "memecahkan", "mengotori",
        "menghiasi", "merusak pemandangan", "mengganggu ketertiban", "memalukan", "mencemarkan",
    ],
    "road_damage": [
        "merusak", "menghancurkan", "mengancam", "membahayakan", "mengganggu",
        "menyusahkan", "menghambat", "melukai", "menjatuhkan", "merugikan",
    ],
}

OBJECTS = {
    "flood": [
        "pemukiman warga", "rumah penduduk", "lahan pertanian", "akses jalan", "sekolah",
        "pasar tradisional", "rumah sakit", "kantor pemerintah", "area persawahan", "permukiman padat",
    ],
    "garbage": [
        "pinggir jalan", "aliran sungai", "lahan kosong", "pemukiman", "pasar tradisional",
        "saluran air", "area publik", "taman kota", "tempat wisata", "kawasan pemukiman",
    ],
    "fallen_tree": [
        "mobil", "rumah warga", "kabel listrik", "jalan raya", "pengendara motor",
        "pejalan kaki", "tukang ojek", "angkot", "sepeda motor", "kios pedagang",
    ],
    "vandalism": [
        "fasilitas umum", "tembok bangunan", "taman kota", "halte bus", "jembatan penyeberangan",
        "lampu jalan", "bangunan bersejarah", "taman bermain", "stasiun kereta", "terminal bus",
    ],
    "road_damage": [
        "jalan provinsi", "jalan desa", "jembatan", "trotoar", "jalan lingkar",
        "jalan alternatif", "jalan tol", "jalan utama", "jalan setapak", "jalan lintas kecamatan",
    ],
}

DETAILS = {
    "flood": [
        "setinggi setengah meter", "setelah hujan deras semalaman", "akibat tanggul jebol",
        "sampai satu meter", "sejak pagi hari", "akibat luapan sungai", "setinggi satu meter lebih",
        "akibat hujan lebat selama berjam jam", "setelah kiriman air dari hulu", "membuat warga panik",
        "menyebabkan puluhan keluarga mengungsi", "setinggi dada orang dewasa",
    ],
    "garbage": [
        "sudah seminggu tidak diangkut", "menimbulkan bau busuk", "menyumbat saluran air",
        "berceceran dimana-mana", "mencemari lingkungan sekitar", "sudah berbulan-bulan dibiarkan",
        "membuat pemandangan kumuh", "menjadi sarang penyakit", "mengganggu aktivitas warga",
        "bau pesing menyengat", "dipenuhi lalat dan belatung",
    ],
    "fallen_tree": [
        "akibat angin kencang", "setelah diguyur hujan lebat", "karena tanah longsor",
        "pohon sudah lapuk", "diterjang angin puting beliung", "akibat hujan disertai angin",
        "pohon sudah tua", "akibat akar pohon rapuh", "setelah badai semalam",
        "menghalangi akses jalan selama berjam jam",
    ],
    "vandalism": [
        "dilakukan oknum tak bertanggung jawab", "terjadi pada malam hari",
        "meresahkan warga setempat", "sudah berkali-kali terjadi", "membuat pemandangan tidak sedap",
        "dilakukan saat subuh", "diduga pelaku masih di bawah umur",
        "merusak fasilitas yang baru dibangun", "terjadi di siang bolong",
        "dilakukan secara berkelompok",
    ],
    "road_damage": [
        "sudah bertahun-tahun tidak diperbaiki", "membahayakan pengguna jalan",
        "menyebabkan kemacetan parah", "sering menimbulkan kecelakaan",
        "dikeluhkan warga sejak lama", "sudah berkali-kali dilaporkan",
        "bikin pengendara harus ekstra hati hati", "nyaris menelan korban jiwa",
        "setiap musim hujan tambah parah", "aspal hancur seperti tak pernah diperbaiki",
    ],
}

PATTERNS = [
    "{subj} {verb} {obj} di {kec}, {detail}.",
    "Di {kec}, {subj} {verb} {obj} {detail}.",
    "{subj} {verb} {obj} di {kec}. {detail}. Warga berharap segera ditangani.",
    "{detail}, akhirnya {subj_low} {verb} {obj} di {kec}.",
    "{subj} di {kec} {verb} {obj} {detail}. Warga resah.",
    "Warga {kec} mengeluh {subj_low} {verb} {obj} mereka {detail}.",
    "{detail}. Akibatnya, {subj_low} {verb} {obj} di {kec}.",
    "Laporan dari {kec}: {subj} {verb} {obj} {detail}.",
    "Di wilayah {kec}, terjadi {subj_low} yang {verb} {obj} {detail}.",
    "Tak tertahankan lagi, {subj_low} {verb} {obj} di {kec} {detail}.",
]


def make_text(label: str, kec: str) -> str:
    subj = random.choice(SUBJECTS[label])
    verb = random.choice(VERBS[label])
    obj = random.choice(OBJECTS[label])
    detail = random.choice(DETAILS[label])
    pattern = random.choice(PATTERNS)
    return pattern.format(subj=subj, verb=verb, obj=obj, kec=kec, detail=detail,
                          subj_low=subj.lower(), detail_low=detail.lower())


def run(limit: int = 1000) -> tuple[Path, list[dict]]:
    print(f"📂 Baca {KEC_PATH.name}...")
    with open(KEC_PATH) as f:
        kecs = [row["name"] for row in csv.DictReader(f)]
    print(f"🏙️  {len(kecs)} kecamatan tersedia")

    random.seed(42)
    labels = ["flood", "garbage", "fallen_tree", "vandalism", "road_damage"]
    data = []

    for label in labels:
        random.shuffle(kecs)
        print(f"   Generating {limit}x {label}...")
        for i in range(limit):
            kec = kecs[i % len(kecs)]
            text = make_text(label, kec)
            data.append({
                "text": text,
                "label": label,
                "source": "kecamatan",
                "location_mention": f"Kecamatan {kec}",
            })

    random.shuffle(data)
    DATA_DIR.mkdir(exist_ok=True)
    path = DATA_DIR / "dataset.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ {len(data)} data → {path}")
    for lbl in labels:
        n = sum(1 for d in data if d["label"] == lbl)
        print(f"   {lbl}: {n}")
    return path, data


if __name__ == "__main__":
    run()
