# Praproses Teks dan Parafrase

## 4.x Text Preprocessing

Sebelum data dianalisis, teks laporan yang diperoleh terlebih dahulu melalui tahap *text preprocessing* untuk meningkatkan kualitas data. Tahapan ini bertujuan membersihkan teks dari elemen-elemen yang tidak relevan serta menyeragamkan bentuknya agar siap diproses oleh model. Proses *text preprocessing* terdiri dari beberapa langkah, yaitu *data cleaning*, *case folding*, *tokenizing*, dan *stopword removal*.

*Data cleaning* dilakukan untuk menghapus elemen non-informatif dari teks laporan, seperti *mention* (misalnya `@mnatori26`), tagar (`#LaporinAja`), *URL*, angka, serta tanda baca yang tidak diperlukan. Langkah ini memastikan teks hanya memuat konten laporan yang bermakna. Selanjutnya, *case folding* menyamakan seluruh huruf menjadi huruf kecil agar kata yang sama dengan penulisan berbeda (misalnya "Pohon" dan "pohon") dianggap identik. Teks yang telah dibersihkan kemudian dipecah menjadi satuan kata melalui *tokenizing*, sehingga diperoleh daftar *token*. Terakhir, *stopword removal* menghapus kata-kata umum yang kurang berpengaruh terhadap makna laporan, seperti "yang", "dan", "di", dan "untuk", sehingga fokus analisis tertuju pada kata-kata yang benar-benar merepresentasikan isi laporan.

Sebagai ilustrasi, teks laporan `@mnatori26 #LaporinAja ada pohon tumbang di jalan raya` setelah melalui *preprocessing* menjadi `pohon tumbang jalan raya`. Hasil *preprocessing* ini kemudian digunakan sebagai masukan pada tahap klasifikasi dan parafrase.

## 4.x Parafrase

Setelah teks melewati tahap *preprocessing*, teks diparafrasekan menjadi bentuk laporan yang lebih formal dan terstruktur. Proses parafrase ini dilakukan dengan menggunakan model bahasa Indonesia berbasis *transformer*, yaitu T5, yang mampu menghasilkan ulang kalimat dengan makna yang setara namun susunan kata yang berbeda. Perlu dibedakan bahwa model **IndoBERT** digunakan pada tahap **klasifikasi** untuk menentukan kategori laporan, sedangkan model **T5** digunakan pada tahap **parafrase** untuk menghasilkan ulang teks menjadi laporan formal.

Parafrase diperlukan karena teks laporan yang berasal dari media sosial (tweet) **tidak boleh disimpan sebagaimana adanya**. Teks asli tweet bersifat informal dan mengandung data pribadi atau gaya bahasa bebas dari pengguna, sehingga tidak layak disimpan secara langsung sebagai laporan resmi. Dengan parafrase, isi laporan diubah menjadi kalimat formal yang baku, sehingga aman untuk disimpan dan mudah dipahami oleh pihak yang menanganinya (admin). Dengan demikian, parafrase berperan penting dalam mengubah data mentah dari media sosial menjadi laporan yang rapi, formal, dan siap dikelola dalam sistem.

Sebagai ilustrasi, teks yang telah di-*preprocess* `pohon tumbang jalan raya` dihasilkan menjadi laporan formal seperti *"Pengguna melaporkan adanya pohon tumbang di jalan raya."* Bentuk formal inilah yang kemudian disimpan dan ditampilkan kepada admin untuk ditindaklanjuti.
