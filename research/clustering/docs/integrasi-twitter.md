# Integrasi Twitter/X API v2 — Panduan Langkah demi Langkah

Panduan mengintegrasikan Twitter Service dengan **X (Twitter) API v2** untuk menerima
laporan warga melalui mention `@handle` + tagar, serta mengirim balasan otomatis
(auto-reply). Menggunakan **OAuth 2.0** (recommended, bisa write) dengan fallback
**OAuth 1.0a**.

> **Catatan API terbaru (2025+):** X API memakai platform *Twitter API v2*. Akses
> gratis (Free tier) tersedia namun terbatas: **tidak bisa posting tweet**
> (write). Untuk auto-reply (write), diperlukan akun berbayar (Basic/Pro) atau
> akses *Elevated*. OAuth 2.0 *user context* hanya tersedia pada tier berbayar.

---

## 1. Prasyarat

- Akun **X (Twitter)** Developer (developer.twitter.com atau developer.x.com).
- Project + App di **X Developer Portal**.
- (Untuk auto-reply/write) **tier berbayar** (Basic/Pro) yang mengizinkan *user
  context* + write.

---

## 2. Membuat Project & App di X Developer Portal

1. Login ke **X Developer Portal** → **Developer Apps**.
2. Buat **Project** baru → beri nama (mis. `ecoguard`).
3. Dalam project, buat **App** baru → beri nama (mis. `ecoguard-twitter`).
4. Buka **Settings** app → **User authentication settings** → **Set up**.
   - **App permissions**: pilih **Read and write** (untuk auto-reply).
   - **Type of App**: *Web App, Automated App or Bot*.
   - **Callback URI / Redirect URL**: `http://localhost:8000/settings/oauth2/callback`
     (atau URL hosting).
   - **Website URL**: URL project.
5. Simpan. X akan menampilkan **Client ID** dan **Client Secret**.

---

## 3. Mendapatkan Kredensial

### A. Kredensial OAuth 2.0 (recommended)

Di **App → Keys and tokens**:

| Item | Nama env |
|------|----------|
| **Client ID** | `TWITTER_OAUTH2_CLIENT_ID` |
| **Client Secret** | `TWITTER_OAUTH2_CLIENT_SECRET` |
| **Bearer Token** (App-only) | `TWITTER_BEARER_TOKEN` |

**Access Token & Refresh Token (user context)** — didapat lewat alur OAuth 2.0
*Authorization Code + PKCE* (lihat Langkah 4).

### B. Kredensial OAuth 1.0a (fallback, untuk posting)

| Item | Nama env |
|------|----------|
| **API Key** (Consumer Key) | `TWITTER_CONSUMER_KEY` |
| **API Secret** (Consumer Secret) | `TWITTER_CONSUMER_SECRET` |
| **Access Token** | `TWITTER_ACCESS_TOKEN` |
| **Access Token Secret** | `TWITTER_ACCESS_TOKEN_SECRET` |

---

## 4. Alur OAuth 2.0 (mendapat Access + Refresh Token)

Sistem memakai **refresh token** untuk menjaga akses tetap hidup tanpa login
ulang. Alur lengkapnya:

1. **Login user** → buka URL otorisasi X:
   ```
   https://twitter.com/i/oauth2/authorize
     ?response_type=code
     &client_id={CLIENT_ID}
     &redirect_uri={REDIRECT_URL}
     &scope=tweet.read%20tweet.write%20users.read%20offline.access
     &state={random_state}
     &code_challenge={PKCE_challenge}
     &code_challenge_method=S256
   ```
2. User menyetujui → X redirect ke `redirect_uri?code={AUTH_CODE}`.
3. **Tukar code → token**:
   ```
   POST https://api.twitter.com/2/oauth2/token
   grant_type=authorization_code
   code={AUTH_CODE}
   client_id={CLIENT_ID}
   client_secret={CLIENT_SECRET}
   redirect_uri={REDIRECT_URL}
   code_verifier={PKCE_verifier}
   ```
4. Response berisi **access_token + refresh_token**. Simpan keduanya.
5. Saat token expired, sistem otomatis pakai **refresh_token** di endpoint yang
   sama (`grant_type=refresh_token`), lalu menyimpan token baru ke MongoDB.

---

## 5. Mengisi Environment (.env)

Salin `.env.example` ke `.env` di root, lalu isi:

```bash
# OAuth 2.0 — untuk posting auto-reply
TWITTER_OAUTH2_CLIENT_ID=xxxxxxxxxxxx
TWITTER_OAUTH2_CLIENT_SECRET=yyyyyyyyyyyy
TWITTER_OAUTH2_ACCESS_TOKEN=zzzz   # hasil langkah 4
TWITTER_OAUTH2_REFRESH_TOKEN=wwww  # hasil langkah 4

# Bearer (app-only, untuk search/read)
TWITTER_BEARER_TOKEN=bbbb

# OAuth 1.0a fallback (opsional)
TWITTER_CONSUMER_KEY=cccc
TWITTER_CONSUMER_SECRET=dddd
TWITTER_ACCESS_TOKEN=eeee
TWITTER_ACCESS_TOKEN_SECRET=ffff

# Handle & rule mention
TWITTER_HANDLE=mnatori26
TWITTER_MENTION_RULE=#LaporinAja
```

> Token OAuth2 juga bisa di-seed via HTTP endpoint:
> `POST http://localhost:8000/settings/oauth2` dengan body JSON
> `{access_token, refresh_token, client_id, client_secret}`.

---

## 6. Menjalankan & Menguji

### Jalankan service

```bash
cd backend/twitter-service
npm install
npm start
```

### Cek status kredensial

```bash
# Status OAuth1 (env)
curl http://localhost:8000/settings/twitter

# Test validitas access token OAuth2
curl http://localhost:8000/settings/oauth2/test
```

### Uji ingest tweet (end-to-end)

```bash
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"tweet_id":"test1","text":"ada pohon tumbang di bekasi","media_urls":[]}'
```

---

## 7. Cara Kerja di Sistem (Alur)

```
User tweet @mnatori26 #LaporinAja "pohon tumbang di jalan"
  │
  ├─ Watcher (poll Recent Search via Bearer)
  │    GET /2/tweets/search/recent?query=@mnatori26 #LaporinAja -is:retweet
  │    → tweet baru di-ingest
  │
  └─ Ingest pipeline
       preprocessing → klasifikasi → paraphrase → simpan tweet → clustering
       → auto-reply (OAuth2) via POST /2/tweets
```

---

## 8. Batasan & Catatan Penting (API terbaru)

| Fitur | Free tier | Berbayar (Basic/Pro) |
|-------|-----------|----------------------|
| Baca tweet/search (Recent Search) | ✅ terbatas | ✅ lebih besar |
| Posting tweet / auto-reply (write) | ❌ **tidak bisa** | ✅ |
| OAuth 2.0 user context | ❌ | ✅ |
| Rate limit Recent Search | ~1 req/15 menit | lebih tinggi |

- **Search Recent** hanya menjangkau tweet **7 hari terakhir** (API v2).
- Watcher memakai **Bearer Token** (app-only) untuk membaca mention.
- Auto-reply memakai **OAuth 2.0 user context** (harus tier berbayar).

---

## 9. Endpoint HTTP Twitter Service

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/health` | GET | Health check |
| `/ingest` | POST | Ingest tweet manual |
| `/trigger-classify` | POST | Klasifikasi gambar dari URL |
| `/settings/twitter` | GET/POST | Cek/validasi kredensial OAuth1 |
| `/settings/oauth2` | POST | Seed token OAuth2 ke DB |
| `/settings/oauth2/test` | GET | Test validitas access token |
