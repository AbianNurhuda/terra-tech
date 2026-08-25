# Walkthrough Integrasi Portfolio API

## Tujuan

Integrasi ini mengganti persistence Portfolio berbasis `localStorage` dengan REST API Portfolio yang sudah tersedia. Backend tetap menjadi source of truth; tidak ada backend atau perubahan database yang dibuat.

## Audit Awal

File yang diaudit:

- `src/components/dashboard/CmsPortfolio.jsx`
- `src/pages/Portfolio.jsx`
- `src/utils/cmsDefaults.js`
- `src/services/api.service.js`
- `src/api/client.js`
- seluruh penggunaan `cms_portfolio` di `src`

Hasil audit:

- CMS Portfolio membaca dan menulis `cms_portfolio`.
- Public Portfolio membaca `cms_portfolio`, `defaultPortfolio`, dan dataset Portfolio hardcoded.
- `client.js` sudah menyediakan Bearer token, parsing response, redirect ketika 401, serta error terstruktur.
- Tidak ditemukan penggunaan `cms_portfolio` di luar CMS Portfolio dan halaman publik.

## File yang Diubah

### `src/services/api.service.js`

Ditambahkan `portfolioService` dengan method:

- `getPortfolios(params)` -> `GET /cms/portfolios`
- `getPublicPortfolios()` -> `GET /portfolios`
- `getPortfolio(id)` -> `GET /cms/portfolios/{id}`
- `getPortfolioBySlug(slug)` -> `GET /portfolios/{slug}`
- `createPortfolio(data)` -> `POST /cms/portfolios`
- `updatePortfolio(id, data)` -> `PUT /cms/portfolios/{id}`
- `deletePortfolio(id)` -> `DELETE /cms/portfolios/{id}`
- `uploadGallery(id, file)` -> `POST /cms/portfolios/{id}/gallery`
- `deleteGalleryImage(id, index)` -> `DELETE /cms/portfolios/{id}/gallery/{index}`

Semua request tetap menggunakan `client.js` existing.

### `src/components/dashboard/CmsPortfolio.jsx`

Perubahan utama:

- Menghapus pembacaan dan penulisan `localStorage` Portfolio.
- GET list dilakukan saat component dimuat.
- Create memakai `portfolioService.createPortfolio()`.
- Update memakai `portfolioService.updatePortfolio()`.
- Delete memakai `portfolioService.deletePortfolio()`.
- Setelah create/update, list di-refresh dari backend.
- Form menggunakan field backend:
  - `title`
  - `category`
  - `description`
  - `cover_image_url`
  - `client_name`
  - `status`
- Status API menggunakan lowercase `published` dan `draft`; label UI tetap `Published` dan `Draft`.
- Cover image memakai `cover_image_url` dengan fallback image.
- Loading state dan error state dengan tombol retry ditambahkan.
- File gallery dikirim setelah Portfolio memiliki ID.
- Gallery existing dapat dihapus melalui endpoint backend.

Layout, modal, tabel, dialog konfirmasi, dan pola UX existing tetap dipertahankan.

### `src/pages/Portfolio.jsx`

Perubahan utama:

- Menghapus penggunaan `localStorage` sebagai source data.
- Menggunakan `portfolioService.getPublicPortfolios()`.
- Public page hanya menampilkan item dengan `status === "published"`.
- Filter kategori tetap tersedia dan menggunakan nilai kategori backend.
- Data gambar memakai `cover_image_url`.
- Gallery memakai `gallery_image_urls`.
- Loading state tidak menampilkan data palsu.
- Error state menampilkan pesan dan tombol retry.
- Dataset lama hanya dipakai sebagai enrichment presentasi opsional untuk metadata detail yang belum tersedia dari contract Portfolio; field utama dan gallery API menimpa nilai tersebut.

## Data Flow CMS

```text
Buka CMS Portfolio
  -> GET /cms/portfolios
  -> tampilkan list backend

Submit tambah
  -> POST /cms/portfolios
  -> dapatkan Portfolio ID
  -> POST /cms/portfolios/{id}/gallery untuk setiap file gallery
  -> GET ulang list

Submit edit
  -> PUT /cms/portfolios/{id}
  -> upload file gallery baru jika ada
  -> GET ulang list

Hapus Portfolio
  -> konfirmasi user
  -> DELETE /cms/portfolios/{id}
  -> hapus item dari UI

Hapus gambar gallery
  -> DELETE /cms/portfolios/{id}/gallery/{index}
  -> GET detail Portfolio terbaru
  -> update item di UI
```

## Data Flow Public

```text
Buka /portofolio
  -> GET /portfolios
  -> filter status === "published"
  -> filter kategori di frontend
  -> render cover_image_url dan gallery_image_urls
```

Portfolio dengan status `draft` tidak dirender di halaman publik.

## RBAC

RBAC UI existing tetap digunakan:

| Role | Read | Create | Edit | Delete |
|---|---:|---:|---:|---:|
| `super_admin` | Ya | Ya | Ya | Ya |
| `admin` | Ya | Ya | Ya | Ya |
| `editor` | Ya | Ya | Ya | Tidak |
| `operator` | Ya | Tidak | Tidak | Tidak |

Permission frontend hanya untuk UX. Backend tetap menjadi security authority. Response `401` dan `403` dari API harus tetap dihormati.

## Error Handling

`client.js` existing menangani dan menormalisasi:

- `401`: session dibersihkan dan user diarahkan ke login.
- `403`: response permission error diteruskan ke UI.
- `404`, `409`, `422`, `500`: message API diteruskan ke UI.
- Network error: dikembalikan sebagai error koneksi.

CMS dan public page menampilkan error loading Portfolio serta retry action.

## Security

- Tidak ada database connection di frontend.
- Tidak ada API secret baru.
- Bearer token tetap berasal dari `client.js`.
- Tidak memakai `dangerouslySetInnerHTML`.
- Link external yang sudah ada menggunakan `rel="noreferrer"`.
- Role frontend tidak dianggap sebagai security boundary.
- `cms_portfolio` tidak lagi digunakan sebagai persistence Portfolio.

## Verifikasi

Perintah yang dijalankan:

```text
npm.cmd run lint
```

Hasil: berhasil dengan `0 errors`. Repository masih memiliki warning lint lama pada file lain.

```text
npm.cmd run build
```

Hasil: berhasil. Vite memberi warning ukuran chunk JavaScript di atas 500 kB; warning ini tidak berasal dari error integrasi Portfolio.

Editor diagnostics untuk tiga file yang diubah juga tidak menemukan error.

## Belum Diverifikasi

Browser flow production belum dijalankan karena membutuhkan sesi login dan kredensial user yang valid. Hal-hal berikut perlu dites terhadap backend aktual:

1. Login sebagai setiap role dan akses CMS Portfolio.
2. GET, create, edit, dan delete Portfolio.
3. Upload dan delete gallery.
4. Response public hanya berisi Portfolio published.
5. Fallback image dan retry ketika API gagal.
6. Nama field multipart gallery. Implementasi saat ini mengirim file dengan key `file`; backend perlu mengonfirmasi bahwa key tersebut sesuai contract aktual.

Karena browser test dan verifikasi endpoint production belum dijalankan, implementasi ini tidak mengklaim production verification.
