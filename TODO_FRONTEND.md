# Terra Tech Frontend — Development TODO & Production Audit

Dokumen handoff ini merangkum status audit produksi, verifikasi alur autentikasi, matriks penanganan error, hasil pengujian runtime API, serta rekomendasi keamanan bagi tim frontend dan backend.

---

## 1. Project Status

Project **Terra Tech Frontend** dibangun menggunakan:
- **React 19** & **Vite 8**
- **React Router 7** (Routing halaman publik dan CMS Dashboard)
- **Tailwind CSS 3** & **Lucide React**
- Arsitektur standar: `Component` → `api.service.js` → `client.js` → `Backend REST API` → `Database`
- Seluruh dependensi terpasang dan build production (`npm run build`) berjalan bersih tanpa error.

---

## 2. Environment

- File konfigurasi `.env` telah disiapkan untuk local development.
- Base URL API backend:
  ```env
  VITE_API_URL=https://api.terratech.my.id/api/v1
  ```
- File `.env`, `.env.local`, dan `.env.*.local` diabaikan oleh Git via `.gitignore`.
- Tidak ada data credential rahasia, secret key, atau koneksi database langsung di sisi frontend.

---

## 3. Module Status Matrix

| Modul CMS | Frontend UI | Frontend Service | Backend API | Runtime Verification | Status Integrasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CMS Dashboard / Stats** | DONE | DONE | AVAILABLE | AVAILABLE — NOT RUNTIME VERIFIED (401 Protected) | ⏳ READY (Awaiting Auth Session) |
| **Informasi & Artikel** | DONE | DONE | AVAILABLE | AVAILABLE — NOT RUNTIME VERIFIED (401 Protected) | ⏳ READY (Awaiting Auth Session) |
| **Pengumuman Staf** | DONE | DONE | AVAILABLE | AVAILABLE — NOT RUNTIME VERIFIED (401 Protected) | ⏳ READY (Awaiting Auth Session) |
| **Timeline & Milestone** | DONE | DONE | AVAILABLE | AVAILABLE — NOT RUNTIME VERIFIED (401 Protected) | ⏳ READY (Awaiting Auth Session) |
| **Dokumen & File** | DONE | DONE | AVAILABLE | AVAILABLE — NOT RUNTIME VERIFIED (401 Protected) | ⏳ READY (Awaiting Auth Session) |
| **Alur Pendaftaran** | DONE | DONE | AVAILABLE | AVAILABLE — NOT RUNTIME VERIFIED (401 Protected) | ⏳ READY (Awaiting Auth Session) |
| **Kelola Pengguna** | DONE | DONE | NOT AVAILABLE | BLOCKED (HTTP 404) | ⏸️ BLOCKED (Waiting Backend Route) |
| **Profil Perusahaan** | DONE | DONE | NOT AVAILABLE | BLOCKED (HTTP 404) | ⏸️ BLOCKED (Waiting Backend Route) |
| **Kategori Dokumen** | DONE | DONE | NOT AVAILABLE | BLOCKED (HTTP 404) | ⏸️ BLOCKED (Waiting Backend Route) |

---

## 4. Detailed Runtime API Verification Results

### A. Authentication Endpoints
- `POST /api/v1/auth/login` — **AVAILABLE — NOT RUNTIME VERIFIED** (Endpoint contract ready)
- `POST /api/v1/auth/logout` — **AVAILABLE — NOT RUNTIME VERIFIED** (Endpoint contract ready)
- `GET  /api/v1/auth/me` — **PASS (HTTP 401 Protected)** (Berhasil memvalidasi proteksi middleware)

### B. Public Endpoints (100% Live Tested)
- `GET /api/v1/information` — **PASS (HTTP 200 OK)** — Data `items` & `pagination` diterima normal.
- `GET /api/v1/announcements` — **PASS (HTTP 200 OK)** — Data `items` & `pagination` diterima normal.
- `GET /api/v1/timelines` — **PASS (HTTP 200 OK)** — Data `items` & `pagination` diterima normal.
- `GET /api/v1/files` — **PASS (HTTP 200 OK)** — Data `items` & `pagination` diterima normal.
- `GET /api/v1/registration-flow` — **PASS (HTTP 200 OK)** — Data `items` & `pagination` diterima normal.

### C. CMS Endpoints & Mutation Policy

#### CMS Dashboard
- `GET /api/v1/cms/dashboard` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `GET /api/v1/cms/dashboard/stats` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `GET /api/v1/cms/dashboard/drafts` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `GET /api/v1/cms/dashboard/activity` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `GET /api/v1/cms/dashboard/analytics` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `GET /api/v1/cms/dashboard/system-health` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)

#### CMS Information
- `GET /api/v1/cms/information` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `POST /api/v1/cms/information` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `GET /api/v1/cms/information/{id}` — **AVAILABLE — NOT RUNTIME VERIFIED**
- `PUT /api/v1/cms/information/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `DELETE /api/v1/cms/information/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**

#### CMS Announcements
- `GET /api/v1/cms/announcements` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `POST /api/v1/cms/announcements` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `GET /api/v1/cms/announcements/{id}` — **AVAILABLE — NOT RUNTIME VERIFIED**
- `PUT /api/v1/cms/announcements/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `DELETE /api/v1/cms/announcements/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**

#### CMS Timelines
- `GET /api/v1/cms/timelines` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `POST /api/v1/cms/timelines` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `GET /api/v1/cms/timelines/{id}` — **AVAILABLE — NOT RUNTIME VERIFIED**
- `PUT /api/v1/cms/timelines/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `DELETE /api/v1/cms/timelines/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**

#### CMS Files
- `GET /api/v1/cms/files` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `POST /api/v1/cms/files` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `GET /api/v1/cms/files/{id}` — **AVAILABLE — NOT RUNTIME VERIFIED**
- `DELETE /api/v1/cms/files/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**

#### CMS Registration Steps
- `GET /api/v1/cms/registration-steps` — **AVAILABLE — NOT RUNTIME VERIFIED** (401 Protected)
- `POST /api/v1/cms/registration-steps` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `GET /api/v1/cms/registration-steps/{id}` — **AVAILABLE — NOT RUNTIME VERIFIED**
- `PUT /api/v1/cms/registration-steps/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**
- `DELETE /api/v1/cms/registration-steps/{id}` — **BLOCKED — Mutation test requires dedicated staging/test data.**

### D. Inactive / Missing Endpoints (HTTP 404)
- `GET /api/v1/cms/users` — **BLOCKED (HTTP 404 Not Found)**
- `GET /api/v1/cms/company-profile` — **BLOCKED (HTTP 404 Not Found)**
- `GET /api/v1/cms/file-categories` — **BLOCKED (HTTP 404 Not Found)**

---

## 5. HTTP Error Handling Matrix

| HTTP Status | Penyebab | Respon Frontend & UX Feedback |
| :--- | :--- | :--- |
| **401 Unauthorized** | Token kedaluwarsa / belum login | `ApiClient` otomatis membersihkan session local storage dan mengarahkan ke `/login`. Menampilkan pesan *"Sesi Anda telah berakhir. Silakan login kembali."* |
| **403 Forbidden** | Akun tidak memiliki hak akses role | Menampilkan pesan *"Anda tidak memiliki izin (otorisasi) untuk mengakses data/fitur ini."* |
| **404 Not Found** | Endpoint backend belum tersedia / data tidak ditemukan | Menampilkan pesan *"Endpoint/data tidak ditemukan. Silakan hubungi administrator/backend developer."* |
| **409 Conflict** | Bentrok relasi (misal: kategori file sedang digunakan) | Menampilkan pesan peringatan konflik spesifik dan membatalkan mutasi. |
| **422 Unprocessable** | Validasi backend gagal (email duplikat, format salah) | Memetakan error field langsung ke bawah input form yang bersangkutan. |
| **500 / 5xx Server Error** | Masalah internal server backend | Menampilkan pesan ramah *"Server backend sedang mengalami kendala. Silakan coba beberapa saat lagi."* tanpa stack trace. |
| **Network Error** | Backend offline / koneksi internet terputus | Menampilkan pesan *"Tidak dapat terhubung ke server backend. Periksa koneksi internet Anda."* beserta tombol **Coba Lagi (Retry)**. |

---

## 6. Auth Security & Token Handling Review

### Current Architecture Review
1. **Penyimpanan Token**: Token Bearer disimpan di `localStorage.getItem("api_token")`.
2. **Injeksi Header**: `src/api/client.js` otomatis menyematkan header `Authorization: Bearer <token>` pada setiap request terproteksi.
3. **Pembersihan Log Konsol**: `console.log` yang mencetak URL endpoint telah dibersihkan. Tidak ada token atau Authorization header yang dicetak ke console browser.

### Security Consideration & Recommendation
> [!IMPORTANT]
> **XSS Token Theft Consideration**:
> Penyimpanan token di `localStorage` rentan terhadap serangan Cross-Site Scripting (XSS) jika terdapat injeksi skrip berbahaya pada client.
> 
> **Rekomendasi Arsitektur Masa Depan**:
> *"Evaluate HttpOnly + Secure + SameSite cookie-based authentication with backend team."*
> Menggunakan cookie `HttpOnly` akan mencegah akses skrip JavaScript client ke token autentikasi secara menyeluruh.

---

## 7. Blocked Modules & Required Backend Endpoints

### Kelola Pengguna
- **Status**: `BLOCKED — Backend API belum tersedia.`
- **Current frontend endpoint**: `GET /api/v1/cms/users`
- **Required backend API**: `GET /cms/users`, `POST /cms/users`, `PUT /cms/users/{id}`, `DELETE /cms/users/{id}`, `PUT /cms/users/{id}/password`, `PUT /cms/users/{id}/status`.

### Profil Perusahaan
- **Status**: `BLOCKED — Backend API belum tersedia.`
- **Current frontend endpoint**: `GET /api/v1/cms/company-profile`
- **Required backend API**: `GET /cms/company-profile`, `POST/PUT /cms/company-profile` (multipart/form-data untuk upload logo & favicon).

### Kategori Dokumen
- **Status**: `BLOCKED — Backend API belum tersedia.`
- **Current frontend endpoint**: `GET /api/v1/cms/file-categories`
- **Required backend API**: `GET /cms/file-categories`, `POST /cms/file-categories`, `PUT /cms/file-categories/{id}`, `DELETE /cms/file-categories/{id}`.

---

## 8. Testing History

1. `npm install` -> Seluruh dependensi terpasang.
2. `npm run lint` -> **Lolos (0 Errors)**.
3. `npm run build` -> **Berhasil (Exit code 0)** — 1615 modul terkompilasi.
4. `npm run preview` -> Berhasil diuji pada port 4173.
