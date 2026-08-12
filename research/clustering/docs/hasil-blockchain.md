# Hasil Blockchain (Rekam Jejak Laporan)

## Kalimat Pembuka

Setiap proses klasifikasi dan pencatatan laporan direkam secara permanen dalam rantai blok (*blockchain*). Setiap blok menyimpan data laporan beserta nilai *hash*, di mana blok berikutnya merujuk pada *hash* blok sebelumnya (*previous hash*) sehingga membentuk rantai yang saling terhubung dan tahan terhadap manipulasi.

## Hasil Pencatatan Blockchain

Rantai blok yang terbentuk terdiri atas **7 blok** (blok genesis + 6 blok laporan). Hasil verifikasi rantai dengan metode `is_valid_chain` menunjukkan rantai **valid** (tidak ada data yang rusak/diubah).

**Tabel 4.x — Rantai Blok Laporan (Previous Hash → Hash)**

| Index | Tweet ID | Label | Previous Hash | Hash |
|-------|----------|-------|---------------|------|
| 0 | *(genesis)* | — | `000000...0000` (64×0) | `00009dfa82e0...cf8a1` |
| 1 | audit-tweet-2 | — | `00009dfa82e0...cf8a1` | `00005feaf1f5...9f14` |
| 2 | test_e2e_001 | environmental_issue | `00005feaf1f5...9f14` | `0000b09b31dc...64bb` |
| 3 | 2084910057733673134 | environmental_issue | `0000b09b31dc...64bb` | `000044ff9f4b...8f04` |
| 4 | 2084905212725354614 | environmental_issue | `000044ff9f4b...8f04` | `000009fe5dcc...3f7d` |
| 5 | 2084905473602732498 | environmental_issue | `00008577670d...fdb4d` | `0000d8bc1128...fe67` |
| 6 | 2084855284133232783 | environmental_issue | `0000d8bc1128...fe67` | `0000d8bc1128...fe67` |

## Sample Tweet dengan Previous & Current Hash

Untuk memperjelas, berikut sample pencatatan tweet ke blockchain. Setiap blok laporan berisi:
- **Previous hash**: nilai hash blok sebelumnya (penghubung rantai).
- **Hash**: nilai hash blok ini (dihitung dari data + nonce via proof-of-work).

### Contoh: Blok Index 2 (tweet `test_e2e_001`)

| Field | Nilai |
|-------|-------|
| Index | 2 |
| Tweet ID | `test_e2e_001` |
| Label | `environmental_issue` |
| **Previous Hash** | `00005feaf1f51636f419b36abbe60d9f547468ff5433bfe033c4a8e928be9f14` |
| **Hash** | `0000b09b31dcbcde056002ccacef47048c2694fc82813bcb765f063ddbaf64bb` |

### Contoh: Blok Index 3 (tweet `2084910057733673134`)

| Field | Nilai |
|-------|-------|
| Index | 3 |
| Tweet ID | `2084910057733673134` |
| Label | `environmental_issue` |
| **Previous Hash** | `0000b09b31dcbcde056002ccacef47048c2694fc82813bcb765f063ddbaf64bb` |
| **Hash** | `000044ff9f4b51f7f15c320107e8c18b7ce2d9787e1c0e953e98c7a4e5ab8f04` |

Terlihat bahwa **previous hash** blok index 3 sama dengan **hash** blok index 2, yang membuktikan rantai blok tersambung dengan benar.

## Verifikasi Integritas

Rantai blok diverifikasi menggunakan metode `is_valid_chain`, yang memeriksa:
1. Setiap blok merujuk ke hash blok sebelumnya yang benar.
2. Index blok berurutan (0, 1, 2, ...).
3. Hash setiap blok valid (sesuai proof-of-work dengan awalan `0000`).

Hasil verifikasi: **`valid: True`** untuk 7 blok. Ini menunjukkan rekam jejak laporan **tamper-proof** — jika satu data diubah, hash berubah dan rantai tidak valid.

## File Pendukung

- `research/clustering/seed_blockchain.py` — seeder mencatat klasifikasi tweet ke blockchain.
- Data rantai: MongoDB `ecoguard_blockchain.blocks`.
