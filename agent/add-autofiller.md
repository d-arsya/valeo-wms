# 📋 WMS Valeo — Task Breakdown Fixing (Revisi)

> **Tech Stack:** Laravel · Inertia.js · Vue
> 
> 
> **Prinsip:** Tidak mengubah fondasi kode yang ada — hanya **menambah, memperbaiki, dan menyesuaikan**.
> 

---

## 📦 MODUL 1 — Spareparts: Peningkatan Form & Field

### 🎯 Tujuan

Mengubah tipe input beberapa field, menambahkan fitur autofill + tambah item baru, menambahkan field baru, serta filter dan sorting pada halaman index.

---

### 🗄️ Backend

### 1.1 Tambah Kolom Baru ke Migration yang Ada (atau Buat Migration Tambahan)

- [ ]  **Cek apakah kolom `po_number`, `value_per_pcs`, `supplier`, `gr_date` sudah ada** di tabel `spareparts`. Jika belum, buat migration tambahan tanpa menyentuh migration lama:
    
    ```bash
    php artisan make:migration add_fields_to_spareparts_table --table=spareparts
    ```
    
- [ ]  Tambahkan kolom-kolom baru tersebut ke array `$fillable` di model `Sparepart` yang sudah ada (hanya append, jangan hapus yang lama).

### 1.2 Tambahkan Endpoint Opsional untuk "Tambah Item Baru" pada Autofill

- [ ]  **Cek apakah sudah ada controller untuk Brand, Category, atau Location.** Jika sudah ada, cukup **tambahkan method baru** (misalnya `storeQuick()`) di controller yang sudah ada — jangan buat controller baru.
- [ ]  Jika belum ada endpoint sama sekali, tambahkan route dan method minimalis ke controller yang paling relevan (misal `SparepartController`) khusus untuk handle `POST` tambah item baru secara inline.
- [ ]  Daftarkan route baru tersebut di `routes/web.php` di bawah grup/middleware yang sama dengan route sparepart yang sudah ada.

### 1.3 Tambahkan Validation Rules untuk Field Baru

- [ ]  Buka `StoreSparepartRequest` dan `UpdateSparepartRequest` yang sudah ada.
- [ ]  **Append** rules berikut ke array `rules()` yang sudah ada (jangan timpa rules lama):
    - `po_number` → `nullable|string|max:100`
    - `value_per_pcs` → `nullable|numeric|min:0`
    - `supplier` → `nullable|string|max:255`
    - `gr_date` → `nullable|date`
- [ ]  Pastikan `rank_id` sudah ada di rules; jika belum, tambahkan dengan `required|exists:ranks,id`.

### 1.4 Tambahkan Query Scope untuk Filter & Sorting ke Model yang Ada

- [ ]  Buka model `Sparepart.php` yang sudah ada.
- [ ]  **Tambahkan** method scope berikut (tanpa mengubah method yang sudah ada):
    - `scopeFilterByRank($query, $rankId)` → filter `where('rank_id', $rankId)` jika ada nilai
    - `scopeFilterByStatus($query, $status)` → filter `where('status', $status)` jika ada nilai
    - `scopeApplySorting($query, $sort)` → switch antara `terbaru` / `terlama` / `abjad`

### 1.5 Sesuaikan Controller yang Sudah Ada (Tambah, Bukan Timpa)

- [ ]  Buka `SparepartController.php` yang sudah ada.
- [ ]  Pada method `index()`: **tambahkan** chaining scope filter & sorting ke query yang sudah ada, serta sertakan `filters`, `ranks`, dan `statuses` ke dalam array `Inertia::render()` yang sudah ada.
- [ ]  Pada method `create()` dan `edit()`: **tambahkan** key `ranks`, `brands`, `categories`, `locations` ke array props `Inertia::render()` yang sudah ada — jika belum ada.
- [ ]  **Jangan ubah** logika yang sudah berjalan, hanya append data ke props yang dikirim ke frontend.

---

### 🖥️ Frontend (Inertia Page / Component)

### 1.6 Buat Komponen `ComboboxCreatable` Baru (File Baru, Tidak Mengganggu yang Lain)

- [ ]  Buat file baru `resources/js/Components/ComboboxCreatable.vue`.
- [ ]  Komponen ini menerima props: `options` (array), `modelValue`, `label`, `createEndpoint`.
- [ ]  Fitur yang harus dimiliki:
    - [ ]  Input teks dengan dropdown opsi yang bisa difilter (autofill/typeahead).
    - [ ]  Jika teks yang diketik tidak cocok dengan opsi manapun, tampilkan opsi **"Tambah '[teks input]'"** di bagian bawah dropdown.
    - [ ]  Saat user memilih "Tambah", kirim `POST` ke `createEndpoint`, lalu emit event `item-created` dengan data baru agar parent bisa append ke daftar opsi secara lokal tanpa reload.
- [ ]  Komponen ini **standalone** — tidak mengubah file komponen lain yang sudah ada.

### 1.7 Modifikasi Halaman Form Sparepart yang Sudah Ada

- [ ]  Buka `resources/js/Pages/Spareparts/Form.vue` (atau nama file form yang sudah ada).
- [ ]  **Ganti** input field untuk **Brand**, **Category**, dan **Location** dari tipe input yang sekarang (misalnya `<select>` biasa atau `<input>`) menjadi komponen `<ComboboxCreatable>` yang baru dibuat — tanpa mengubah struktur layout/form secara keseluruhan.
- [ ]  **Ganti** input field **Rank** menjadi `<select>` dropdown biasa (jika belum berupa dropdown) — bind ke `form.rank_id`.
- [ ]  **Tambahkan** field-field baru di bawah field yang sudah ada (jangan sisipkan di tengah jika bisa dihindari):
    - [ ]  Input `po_number`
    - [ ]  Input `value_per_pcs` (type number, tambahkan prefix/label "IDR" di UI)
    - [ ]  Input `supplier`
    - [ ]  Input `gr_date` (type date atau gunakan date picker yang sudah dipakai di project)
- [ ]  Daftarkan field baru ke `useForm()` yang sudah ada (append ke object form, jangan timpa).
- [ ]  Tambahkan tampilan pesan error validasi untuk field baru menggunakan pola yang sama dengan field yang sudah ada.

### 1.8 Modifikasi Halaman Index Sparepart yang Sudah Ada

- [ ]  Buka `resources/js/Pages/Spareparts/Index.vue`.
- [ ]  **Tambahkan** section filter di atas tabel/list yang sudah ada (jangan ubah struktur tabel):
    - [ ]  Dropdown filter **Rank**
    - [ ]  Dropdown filter **Status**
    - [ ]  Dropdown sorting: **Terbaru** / **Terlama** / **Abjad**
- [ ]  Implementasikan reactive filter menggunakan `watch()` + `router.get()` dengan `preserveState: true` dan `replace: true` — ini memastikan filter bekerja tanpa merusak navigasi atau menumpuk history browser.
- [ ]  Terima props baru `filters`, `ranks`, `statuses` dari controller (sudah ditambahkan di task 1.5) dan gunakan sebagai nilai awal filter.

---

## 🐛 MODUL 2 — Spareparts: Perbaikan Bug Tombol "Kembali" (404)

### 🎯 Tujuan

Menghilangkan error 404 yang muncul saat user menekan tombol "Kembali" setelah mengakses halaman Stock Out, Stock In, Generate QR, Print Label, atau Edit Sparepart.

### Analisis Root Cause

Tombol "Kembali" yang ada saat ini kemungkinan menggunakan `window.history.back()` atau URL/`<a href>` hardcoded. Ini tidak aman di Inertia.js karena SPA tidak selalu memiliki history state yang valid saat user masuk langsung ke URL tertentu.

---

### 🗄️ Backend

- [ ]  **Tidak ada perubahan backend.** Cukup verifikasi bahwa semua named route tujuan tombol "Kembali" sudah terdefinisi di `routes/web.php` dan tidak ada typo. Jalankan `php artisan route:list` untuk konfirmasi.

---

### 🖥️ Frontend (Inertia Page / Component)

### 2.1 Buat Komponen `BackButton` Baru (File Baru)

- [ ]  Buat file baru `resources/js/Components/BackButton.vue`.
- [ ]  Komponen menerima prop `fallback` (URL tujuan jika history tidak tersedia, default ke route index sparepart).
- [ ]  Gunakan `router.visit(props.fallback)` dari Inertia — **hindari** `window.history.back()` karena tidak reliable di SPA.
- [ ]  Komponen ini **hanya file baru**, tidak mengubah file lain.

### 2.2 Ganti Implementasi Tombol "Kembali" di Halaman yang Terdampak

- [ ]  Buka satu per satu halaman berikut dan **ganti hanya bagian tombol kembali** — jangan ubah logika lain:
    - [ ]  `Spareparts/StockOut.vue` → ganti dengan `<BackButton :fallback="route('spareparts.index')" />`
    - [ ]  `Spareparts/StockIn.vue` → ganti dengan `<BackButton :fallback="route('spareparts.index')" />`
    - [ ]  `Spareparts/GenerateQR.vue` → ganti dengan `<BackButton :fallback="route('spareparts.index')" />`
    - [ ]  `Spareparts/PrintLabel.vue` → ganti dengan `<BackButton :fallback="route('spareparts.index')" />`
    - [ ]  `Spareparts/Edit.vue` → ganti dengan `<BackButton :fallback="route('spareparts.index')" />`
- [ ]  Import `BackButton` di masing-masing halaman (atau daftarkan sebagai global component — lihat task 3.2).

---

## 🌐 MODUL 3 — General: Perbaikan Tombol "Kembali" di Seluruh Aplikasi

### 🎯 Tujuan

Memastikan semua tombol "Kembali" di seluruh modul WMS tidak memicu error 404, tanpa menulis ulang halaman-halaman yang ada.

---

### 🗄️ Backend

- [ ]  Jalankan `php artisan route:list --name=` dan pastikan tidak ada named route yang hilang atau berubah nama tanpa diperbarui di frontend.
- [ ]  **Tidak ada perubahan logika backend.**

---

### 🖥️ Frontend (Inertia Page / Component)

### 3.1 Audit Codebase untuk Menemukan Semua Tombol "Kembali" yang Bermasalah

- [ ]  Jalankan pencarian global berikut di terminal untuk menemukan semua potensi masalah:
    
    ```bash
    grep -rn "history\.back\|window\.location\|location\.href" resources/js/Pages/
    ```
    
- [ ]  Buat daftar file yang ditemukan — itulah halaman yang perlu diperbaiki.

### 3.2 Daftarkan `BackButton` sebagai Global Component (Opsional tapi Direkomendasikan)

- [ ]  Buka `resources/js/app.js` yang sudah ada.
- [ ]  **Tambahkan** registrasi global component di bawah registrasi yang sudah ada:
    
    ```jsx
    import BackButton from './Components/BackButton.vue'app.component('BackButton', BackButton)
    ```
    
- [ ]  Dengan ini, `<BackButton>` bisa langsung dipakai di semua halaman tanpa perlu import per file — tidak ada perubahan pada file lain.

### 3.3 Terapkan `BackButton` ke Semua Halaman yang Ditemukan di Audit

- [ ]  Untuk setiap halaman dari hasil audit (task 3.1), **ganti hanya bagian tombol kembali** dengan `<BackButton>` — prop `fallback` diisi dengan route yang paling logis untuk halaman tersebut.
- [ ]  **Jangan ubah** layout, logika data, atau bagian lain dari halaman tersebut.

### 3.4 Pastikan Halaman Error Sudah Punya Navigasi yang Benar

- [ ]  Buka halaman error yang sudah ada (biasanya `Pages/Error.vue` atau `errors/404.vue`).
- [ ]  Pastikan sudah ada tombol/link navigasi menggunakan `<Link>` Inertia atau `router.visit()` — bukan tag `<a href>` biasa yang akan menyebabkan full page reload.
- [ ]  Jika belum ada, **tambahkan** tombol "Kembali ke Beranda" tanpa mengubah desain halaman error yang sudah ada.

---

## ✅ Ringkasan Task berdasarkan Prioritas

| Prioritas | Task | Pendekatan | Modul |
| --- | --- | --- | --- |
| 🔴 High | Perbaikan bug 404 tombol kembali (Spareparts) | Buat `BackButton.vue` baru + ganti hanya baris tombol di halaman terdampak | Modul 2 |
| 🔴 High | Audit & perbaikan tombol kembali general | Grep → ganti per halaman | Modul 3 |
| 🟡 Medium | Implementasi Combobox autofill + tambah item baru | Buat `ComboboxCreatable.vue` baru + ganti field di `Form.vue` | Modul 1 |
| 🟡 Medium | Filter reaktif Rank & Status + Sorting | Tambah section filter di `Index.vue` yang ada | Modul 1 |
| 🟡 Medium | Tambah field baru ke form | Append ke `useForm()` + tambah input di bawah field yang ada | Modul 1 |
| 🟡 Medium | Tambah validation rules field baru | Append ke `rules()` di FormRequest yang ada | Modul 1 |
| 🟡 Medium | Tambah query scope filter & sorting | Append method scope ke Model yang ada | Modul 1 |
| 🟢 Low | Dropdown Rank (ubah ke `<select>` jika belum) | Ganti hanya field Rank di `Form.vue` | Modul 1 |
| 🟢 Low | Daftarkan `BackButton` sebagai global component | Append 2 baris di `app.js` yang ada | Modul 3 |

---

> 📝 **Prinsip Kerja:**
> 
> - **Buat file baru** untuk komponen (`BackButton.vue`, `ComboboxCreatable.vue`) — tidak menyentuh komponen lain.
> - **Append** ke file yang ada (FormRequest, Model, Controller, `app.js`) — tidak menimpa atau menghapus kode yang sudah ada.
> - **Ganti hanya bagian spesifik** di halaman Vue yang terdampak (tombol kembali, field input tertentu) — bukan rewrite halaman.
