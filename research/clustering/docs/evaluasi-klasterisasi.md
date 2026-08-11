# Evaluasi Klasterisasi

## 4.1 Karakteristik Data Uji

Pada tahap pengujian, digunakan dataset kejadian bencana BNPB yang memuat koordinat geografis (latitude dan longitude) dari 450 kabupaten/kota di Indonesia. Dataset ini berperan sebagai data pengujian (*proxy data*) untuk mengkalibrasi dan mengevaluasi parameter algoritma DBSCAN, khususnya dalam mengukur kualitas pengelompokan data geolokasi. Pemilihan data ini didasarkan pada ketersediaan koordinat spasial yang lengkap dan cakupan wilayah yang luas, sehingga mampu menguji kinerja algoritma pada sebaran titik yang heterogen.

**[TABEL 4.1 — Karakteristik Dataset]**

| Aspek | Keterangan |
|-------|------------|
| Nama Dataset | Kejadian Bencana BNPB |
| Jumlah Titik | 450 kabupaten/kota |
| Koordinat | Latitude, Longitude |
| Cakupan | Nasional (seluruh Indonesia) |
| Peran | Data pengujian (proxy) untuk kalibrasi parameter |

## 4.2 Evaluasi Klasterisasi

Untuk menentukan parameter optimal algoritma DBSCAN, dilakukan *grid search* terhadap kombinasi nilai Epsilon dan MinPts. Kualitas pengelompokan dievaluasi menggunakan metrik **Silhouette Score**, yang mengukur seberapa mirip suatu titik dengan klaster tempatnya berada dibandingkan klaster lain. Nilai Silhouette berkisar antara −1 hingga 1; semakin mendekati 1 berarti klaster semakin padat dan terpisah dengan baik, sedangkan nilai mendekati 0 atau negatif menunjukkan klaster yang tumpang tindih atau salah pengelompokan. Selain Silhouette Score, proporsi data yang teridentifikasi sebagai *noise* juga menjadi indikator kualitas, karena *noise* merepresentasikan titik yang tidak termasuk dalam klaster mana pun.

**[TABEL 4.2 — Hasil Grid Search Kombinasi Parameter]**

| Epsilon (km) | MinPts | Jumlah Klaster | Noise (%) | Silhouette Score |
|--------------|--------|----------------|-----------|------------------|
| 94,84 | 5 | 8 | 28,7% | 0,445 |
| 60,00 | 3 | 22 | 34,4% | 0,434 |
| 34,29 | 2 | 49 | 53,8% | 0,520 |

Berdasarkan Tabel 4.2, terlihat bahwa pemilihan nilai Epsilon sangat memengaruhi struktur klaster yang dihasilkan. Semakin kecil nilai Epsilon, semakin banyak klaster yang terbentuk namun diiringi peningkatan proporsi *noise*. Sebaliknya, Epsilon yang terlalu besar menyebabkan klaster-klaster yang berdekatan menyatu menjadi satu klaster yang luas. Hal ini menunjukkan bahwa penentuan Epsilon perlu menyeimbangkan antara granularitas klaster dan proporsi data yang tidak terkelompokkan.

**[GAMBAR 4.1 — Plot K-Distance untuk Estimasi Epsilon]**
*(tempatkan di sini; menjelaskan dasar penentuan nilai Epsilon melalui titik siku/knee pada kurva jarak tetangga terdekat)*

> Gambar 4.1 memperlihatkan kurva k-distance yang digunakan sebagai dasar estimasi rentang Epsilon. Nilai Epsilon yang ideal umumnya berada di sekitar titik siku (*knee*) pada kurva tersebut, yaitu titik di mana terjadi perubahan kemiringan yang signifikan.

Pada pengujian ini, kombinasi parameter yang menghasilkan keseimbangan terbaik adalah **Epsilon sebesar 60 km dan MinPts = 3**, yang membentuk **22 klaster** dengan **Silhouette Score 0,434** serta **34,4% data teridentifikasi sebagai noise**. Nilai Silhouette 0,434 menunjukkan bahwa struktur klaster yang terbentuk cukup padat dan terpisah, meskipun tidak sempurna. Proporsi *noise* yang relatif besar (34,4%) disebabkan oleh sebaran data yang luas secara nasional, di mana banyak wilayah terpencil memiliki jarak antar-kota yang melebihi nilai Epsilon sehingga tidak dapat bergabung dengan klaster mana pun.

**[GAMBAR 4.2 — Peta Hasil Pemetaan Spasial DBSCAN]**
*(tempatkan di sini; merupakan bukti visual utama dari hasil klasterisasi)*

> Gambar 4.2 memperlihatkan hasil pemetaan spasial DBSCAN pada data kejadian bencana. Setiap warna merepresentasikan satu klaster, sedangkan titik-titik berwarna gelap menunjukkan data yang teridentifikasi sebagai *noise*. Terlihat bahwa klaster-klaster terbentuk pada wilayah dengan konsentrasi titik yang tinggi, seperti Pulau Jawa, Sumatra, dan Sulawesi, sedangkan wilayah dengan sebaran titik yang jarang cenderung menjadi *noise*.

**[TABEL 4.3 — Detail Klaster yang Terbentuk]**

| Klaster | Nama Wilayah | Jumlah Titik | Centroid (lat, lon) |
|---------|--------------|--------------|---------------------|
| 1 | Bekasi | 15 | −6,23; 107,01 |
| 2 | Surabaya | 12 | −7,25; 112,75 |
| ... | ... | ... | ... |

## 4.3 Interpretasi Hasil

Hasil evaluasi menunjukkan bahwa DBSCAN mampu mengelompokkan data geolokasi ke dalam klaster spasial yang bermakna. Klaster yang terbentuk mencerminkan konsentrasi kejadian di wilayah-wilayah dengan kepadatan titik yang tinggi. Setiap klaster kemudian diberi identitas nama wilayah berdasarkan koordinat pusatnya melalui proses *reverse geocoding*, sehingga memudahkan interpretasi lokasi bagi pihak terkait.

Penerapan pada sistem yang dibangun bekerja sebagai berikut: laporan yang berdekatan secara geografis akan dikelompokkan ke dalam satu klaster, dan klaster tersebut diidentifikasi berdasarkan nama wilayahnya. Dengan demikian, laporan yang berada pada satu wilayah yang sama, misalnya di area Bekasi, akan digabungkan ke dalam satu klaster dan ditugaskan kepada admin wilayah terkait. Hal ini memungkinkan petugas yang berwenang menangani laporan secara terfokus sesuai area masing-masing, sehingga respons terhadap laporan dapat lebih cepat dan tepat sasaran.

Secara keseluruhan, hasil evaluasi klasterisasi ini menunjukkan bahwa algoritma DBSCAN dengan parameter terpilih mampu memetakan sebaran laporan secara spasial dan mengelompokkannya ke dalam klaster yang bermakna. Pemilihan parameter yang tepat, yang diseimbangkan antara kualitas Silhouette dan proporsi noise, menjadi kunci keberhasilan pengelompokan data geolokasi pada sistem ini.
