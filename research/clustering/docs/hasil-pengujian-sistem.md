# Hasil Pengujian Sistem (Unit & Feature Testing)

## Kalimat Pembuka

Pengujian sistem dilakukan untuk memastikan setiap modul dan alur integrasi berfungsi dengan benar. Pengujian unit dilakukan pada setiap service menggunakan framework *pytest*, sedangkan pengujian fitur (*feature testing*) dilakukan untuk memverifikasi alur end-to-end antar-service.

## 1. Hasil Unit Testing

Pengujian unit dijalankan pada setiap service untuk memverifikasi fungsi-fungsi inti masing-masing modul.

**Tabel 4.x — Hasil Unit Testing**

| Modul | Skenario Pengujian | Jumlah | Status |
|-------|--------------------|--------|--------|
| classification-service | Inferensi model, klasifikasi tunggal & multi-gambar | 20 | ✅ Lulus |
| user-auth-service | Password hashing, JWT, user service, auth | 31 | ✅ Lulus |
| notification-service | Kirim notifikasi, mark read | 9 | ✅ Lulus |
| blockchain-service | Pembuatan & validasi blok | 14 | ✅ Lulus |
| issue-service | Setup clustering, DBSCAN, issue service | 25 | ✅ Lulus |
| asset-service | Upload, get, list aset | 7 | ✅ Lulus |
| nlp-service | Generate reply | 10 | ✅ Lulus |

**Total: 116 unit test lulus.**

## 2. Hasil Feature Testing

Pengujian fitur dilakukan untuk memverifikasi alur end-to-end ketika seluruh service berjalan bersamaan.

**Tabel 4.y — Hasil Feature Testing**

| Skenario End-to-End | Status |
|---------------------|--------|
| Alur autentikasi (auth_flow) | ✅ Lulus |
| Alur klasifikasi (classification_flow) | ✅ Lulus |
| Trigger klasifikasi (trigger_classify) | ✅ Lulus |
| Alur notifikasi (notification_flow) | ✅ Lulus |
| Alur penuh sistem (full_flow) | ✅ Lulus |

## Interpretasi

Seluruh unit test dan feature test berhasil lulus, menunjukkan bahwa setiap modul service berfungsi dengan benar dan integrasi antar-service berjalan sesuai yang diharapkan.
