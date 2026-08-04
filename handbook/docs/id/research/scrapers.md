# Scrapers

Generate data laporan dari dataset BNPB untuk clustering.

## Cara

```bash
cd research/scraping
python -m venv venv
venv\Scripts\activate
pip install openpyxl
python app.py
```

Output: `data/dataset.json` — 125 laporan, 25 per label.
