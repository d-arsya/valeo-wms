
# 📋 VALEO WMS — Master Blueprint (plan.md)
> **Single Source of Truth** untuk semua Agent dan Human. Baca dokumen ini **sebelum** menulis satu baris kode pun.
> Dibuat oleh: Planner Agent | Terakhir diperbarui: 2026-04-24

---

## 1. SISTEM OVERVIEW

### 1.1 Business Context
Valeo WMS adalah aplikasi **Warehouse Management System** untuk mengelola stok suku cadang (sparepart) di gudang pabrik. Sistem ini menggantikan pencatatan manual dengan alur digital: Admin mendaftarkan barang → Sistem generate QR Code → Tim lapangan scan QR via smartphone → Stok tercatat real-time → Alert otomatis jika stok kritis → Laporan PDF dicetak untuk audit.

### 1.2 Tech Stack (tidak boleh diubah tanpa persetujuan human)
| Layer | Teknologi |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Frontend Bridge | Inertia.js v3 |
| Frontend UI | React 19, TypeScript Strict Mode |
| Styling | Tailwind CSS v4, Shadcn UI |
| Auth | Laravel Fortify (sudah ter-scaffold) |
| DB | MySQL/SQLite (via `.env`) |
| QR Code | Backend: PHP QR Code library | 
| PDF | Backend: Laravel DomPDF atau Browsershot |
| State/Form | Inertia `useForm` hook |

### 1.3 Core Constraints (WAJIB DIIKUTI)
- **Backend:** Maksimal **300 baris** per file PHP. Gunakan `Trait`, `Observer`, `Action Class` untuk dekomposisi.
- **Frontend:** Maksimal **500 baris** per file React/TSX.
- **DILARANG:** Membuat folder `Services/` atau `Repositories/`. Gunakan `Query Scopes`, `Action Classes`, `Jobs`, `Listeners`.
- **Pattern:** "The Laravel Way" — Thin Controller, Fat Model via Traits & Observers.
- **Validasi:** WAJIB di `FormRequest`, bukan di Controller.

---

## 2. CODEBASE AUDIT (Status Saat Ini)

### ✅ Yang Sudah Ada (Jangan Disentuh Tanpa Alasan)
- `app/Models/User.php` — Model user default Laravel
- `app/Http/Controllers/Settings/*` — Pengaturan akun user
- `app/Actions/Fortify/*` — Logic auth (register, login, 2FA)
- `database/migrations/0001_*` — Migrasi users, cache, jobs
- `database/migrations/2025_08_14_*` — Kolom 2FA pada users
- `resources/js/pages/auth/*` — Halaman login, register, 2FA
- `resources/js/pages/settings/*` — Halaman pengaturan akun
- `resources/js/components/*` — Komponen layout dasar (sidebar, header, dll.)
- `routes/web.php`, `routes/settings.php` — Routing dasar + auth

### ❌ Yang Belum Ada (Harus Dibangun)
Seluruh domain bisnis WMS: tidak ada satu pun model, migration, controller, atau halaman terkait inventory/sparepart.

---

## 3. DATABASE SCHEMA (Normalized Structure)

### Tabel: `brands`
`id, name (unique), created_at, updated_at`

### Tabel: `categories`
`id, name (unique), created_at, updated_at`

### Tabel: `racks`
`id, code (unique), created_at, updated_at`

### Tabel: `bins`
`id, rack_id (FK), code (unique), created_at, updated_at`

### Tabel: `spareparts`
```
id, material_number (unique), part_name, specification, 
brand_id (FK), category_id (FK), bin_id (FK),
safety_stock (int), actual_stock (int),
last_po_number, last_supplier, last_gr_date (date), price_per_unit (decimal),
status (enum: OK, ATTENTION, NG — computed via Observer),
qr_code_path (string nullable),
created_at, updated_at
```

### Tabel: `activity_logs`
```
id, sparepart_id (FK), user_id (FK), control_id (string unique — auto-generated),
type (enum: IN, OUT), quantity (int), 
remarks (string nullable), po_number (string nullable — untuk IN),
gr_date (date nullable — untuk IN), price_per_unit (decimal nullable — untuk IN),
performed_at (timestamp), created_at, updated_at
```

> **ATURAN:** `status` pada `spareparts` **tidak boleh disimpan manual**. Kalkulasi dilakukan di `SparePartObserver` setiap ada mutasi pada `actual_stock`.

---

## 4. PARALLEL ROADMAP

> 🟦 = Worker-Backend | 🟩 = Worker-Frontend | 🔴 = Blocker | 👤 = Human Action Required

### Phase 0 — Foundation (Sequential, tidak bisa paralel)
| # | Task | Agent | Prerequisite |
|---|---|---|---|
| P0-1 | Create migrations: `spareparts`, `activity_logs` | 🟦 BE | - |
| P0-2 | Create `Sparepart` model + `HasStockStatus` Trait + `SparePartObserver` | 🟦 BE | P0-1 |
| P0-3 | Create `ActivityLog` model | 🟦 BE | P0-1 |
| **SYNC-1** | 👤 **Human Review Schema** — validasi kolom & relasi sebelum lanjut | 👤 Human | P0-1, P0-2, P0-3 |

### Phase 1 — Backend Core (Bisa berjalan setelah SYNC-1)
| # | Task | Agent | Prerequisite |
|---|---|---|---|
| B-1 | `FormRequests`: StoreSparepart, UpdateSparepart | 🟦 BE | SYNC-1 |
| B-2 | `SparepartController` (Resource: Index, Store, Show, Update, Destroy) | 🟦 BE | B-1 |
| B-3 | `FormRequests`: StockOutRequest, StockInRequest | 🟦 BE | SYNC-1 |
| B-4 | `StockController` (in/out logic) | 🟦 BE | B-3 |
| B-5 | `QrCodeController` — on-demand label generation (QR + Info) | 🟦 BE | B-2 |
| B-6 | `ReportController` — filter + export PDF | 🟦 BE | B-4 |
| B-7 | Update `routes/web.php` — register all WMS routes | 🟦 BE | B-2..B-6 |

### Phase 1 — Frontend Core (Paralel dengan Phase 1 BE, gunakan mock data untuk UI)
| # | Task | Agent | Prerequisite |
|---|---|---|---|
| F-1 | Layout update: tambah navigasi WMS ke sidebar | 🟩 FE | SYNC-1 |
| ✅ F-2 | `pages/spareparts/Index.tsx` — tabel daftar sparepart + status badge | 🟩 FE | F-1 |
| ✅ F-3 | `pages/spareparts/Create.tsx` — form tambah sparepart | 🟩 FE | F-1 |
| ✅ F-4 | `pages/spareparts/Show.tsx` — detail + tombol Stock IN/OUT | 🟩 FE | F-2 |
| ✅ F-5 | `pages/spareparts/Edit.tsx` — form edit sparepart | 🟩 FE | F-3 |
| ✅ F-6 | `pages/stock/Out.tsx` — form OUT control (qty, PIC, remarks) | 🟩 FE | F-4 |
| ✅ F-7 | `pages/stock/In.tsx` — form IN control (qty, PO, supplier, GR date, price) | 🟩 FE | F-4 |
| F-8 | `pages/scanner/Index.tsx` — QR scanner camera view | 🟩 FE | F-1 |
| F-9 | `pages/labels/Show.tsx` — preview & print QR label | 🟩 FE | F-4 |
| F-10 | `pages/reports/Index.tsx` — filter form + export PDF button | 🟩 FE | F-1 |

### Phase 2 — Integration & Polish
| # | Task | Agent | Prerequisite |
|---|---|---|---|
| I-1 | Wire FE forms ke BE endpoints yang sudah jadi | 🟩 FE | Phase 1 BE selesai |
| I-2 | Test alur OUT Control end-to-end | 🟦 BE + 🟩 FE | I-1 |
| I-3 | Test alur IN Control end-to-end | 🟦 BE + 🟩 FE | I-1 |
| I-4 | Test QR scan → auto-redirect ke Show page | 🟩 FE | I-1 |
| **SYNC-2** | 👤 **Human Integration Review** — test manual di device mobile | 👤 Human | I-1..I-4 |
| I-5 | Final PR: merge `backend` → `main`, merge `frontend` → `main` | 👤 Human | SYNC-2 |

---

## 5. BRANCHING & MERGE STRATEGY

```
main (protected)
├── backend
│   ├── feat/be-schema-spareparts        ← P0-1
│   ├── feat/be-model-sparepart          ← P0-2
│   ├── feat/be-model-activitylog        ← P0-3
│   ├── feat/be-crud-sparepart           ← B-1, B-2
│   ├── feat/be-stock-control            ← B-3, B-4
│   ├── feat/be-qrcode                   ← B-5
│   ├── feat/be-report-pdf               ← B-6
│   └── feat/be-routes                   ← B-7
└── frontend
    ├── feat/fe-layout-nav               ← F-1
    ├── feat/fe-sparepart-index          ← F-2
    ├── feat/fe-sparepart-crud           ← F-3, F-5
    ├── feat/fe-sparepart-show           ← F-4
    ├── feat/fe-stock-control            ← F-6, F-7
    ├── feat/fe-qr-scanner               ← F-8
    ├── feat/fe-qr-label                 ← F-9
    └── feat/fe-report                   ← F-10
```

### Aturan PR
1. Setiap feature branch **wajib** membuat PR ke branch induknya (`backend` atau `frontend`), **bukan ke `main`**.
2. Setiap PR **wajib** di-review oleh **Reviewer Agent** menggunakan checklist `acceptance-criteria.md`.
3. Merge ke `main` **hanya** boleh dilakukan oleh **Human** setelah SYNC-2.
4. Squash merge digunakan untuk menjaga history `main` tetap bersih.

---

## 6. AGENT COMMAND CENTER

### 🟦 WORKER-BACKEND — Baca ini pertama
**File ownership kamu:**
- `app/Models/` — semua model domain WMS
- `app/Models/Traits/` — trait dekomposisi model
- `app/Http/Controllers/SparepartController.php` ← Resource controller
- `app/Http/Controllers/Stock/` — StockIn, StockOut controllers (Single Action if complex)
- `app/Http/Controllers/QrCodeController.php`
- `app/Http/Controllers/ReportController.php`
- `app/Http/Requests/` — semua FormRequests
- `app/Actions/` — Action classes (logika antar model)
- `app/Observers/` — Model observers
- `app/Events/`, `app/Listeners/` — async side-effects
- `database/migrations/` — semua migrasi WMS baru
- `routes/web.php` — tambahkan route group WMS

**Langkah pertama kamu:**
1. Checkout branch `backend` dari `main`.
2. Buat feature branch: `git checkout -b feat/be-schema-spareparts`
3. Buat migrasi `spareparts` dan `activity_logs` sesuai schema di Section 3.
4. Buat PR ke branch `backend`. Tag label: `agent-backend`, `high-priority`.

**Larangan keras:**
- Jangan sentuh file di `resources/js/`
- Jangan sentuh file di `app/Http/Controllers/Settings/`
- Jangan buat folder `Services/` atau `Repositories/`
- Validasi wajib di FormRequest, bukan inline di Controller

---

### 🟩 WORKER-FRONTEND — Baca ini pertama
**File ownership kamu:**
- `resources/js/pages/spareparts/` — [NEW] semua halaman sparepart
- `resources/js/pages/stock/` — [NEW] halaman IN/OUT control
- `resources/js/pages/scanner/` — [NEW] halaman QR scanner
- `resources/js/pages/labels/` — [NEW] halaman QR label
- `resources/js/pages/reports/` — [NEW] halaman laporan
- `resources/js/components/features/` — [NEW] komponen bisnis WMS
- `resources/js/components/app-sidebar.tsx` — tambahkan nav item WMS
- `resources/js/types/` — definisi TypeScript interface domain WMS

**Langkah pertama kamu:**
1. Checkout branch `frontend` dari `main`.
2. Buat feature branch: `git checkout -b feat/fe-layout-nav`
3. Tambahkan menu navigasi WMS ke `app-sidebar.tsx`.
4. Definisikan TypeScript interfaces di `resources/js/types/wms.d.ts` sesuai schema Section 3.
5. Buat PR ke branch `frontend`. Tag: `agent-frontend`.

**Larangan keras:**
- Jangan sentuh file PHP di `app/`
- Jangan sentuh file `routes/`
- Gunakan `useForm` dari Inertia untuk semua form — jangan buat state manual untuk form
- Semua props komponen **wajib** memiliki interface TypeScript yang eksplisit

**Catatan untuk QR Scanner (F-8):**
Gunakan library `html5-qrcode` atau `@zxing/browser`. Install via: `npm install html5-qrcode`. Bungkus dalam `useEffect` untuk manajemen lifecycle kamera.

**Catatan untuk PDF Export (F-10):**
Frontend cukup mengirim request `GET /spareparts/report?from=...&to=...` dengan header `Accept: application/pdf`. Backend yang generate dan stream file-nya.

---

### 🔍 REVIEWER AGENT — Baca ini pertama
**Tugasmu:** Melakukan audit setiap PR sebelum merge ke branch induk.

**Checklist wajib per PR (berdasarkan acceptance-criteria.md):**

#### Checklist Backend PR
- [ ] Migrasi memiliki kolom yang sesuai dengan schema Section 3
- [ ] Observer menghitung `status` otomatis (tidak ada kalkulasi status di Controller)
- [ ] Validasi ada di FormRequest (bukan di Controller body)
- [ ] Controller tidak melebihi 300 baris
- [ ] Tidak ada folder `Services/` atau `Repositories/` yang dibuat
- [ ] `control_id` di `activity_logs` ter-generate otomatis (di Observer/boot)
- [ ] Route terdaftar di `routes/web.php` dalam group `auth` middleware

#### Checklist Frontend PR
- [ ] Semua props memiliki TypeScript interface
- [ ] Form menggunakan `useForm` dari Inertia
- [ ] File tidak melebihi 500 baris
- [ ] Status badge menampilkan emoji yang benar (😮 = ATTENTION, 😡 = NG, ✅ = OK)
- [ ] Komponen UI menggunakan Shadcn (bukan elemen HTML mentah)
- [ ] `cn()` digunakan untuk penggabungan class Tailwind

#### Checklist Acceptance Criteria (dari dokumen)
- [ ] **AC-1 (Master Data):** Form sparepart menyimpan semua 9 field yang dipersyaratkan
- [ ] **AC-2 (QR):** QR Code berisi Material Number, Location, Brand, Specification
- [ ] **AC-3 (Scanner):** Auto-redirect ke halaman detail setelah scan berhasil
- [ ] **AC-4 (OUT):** Stok berkurang real-time setelah konfirmasi, log tercatat otomatis
- [ ] **AC-5 (Status):** Status berubah ke ATTENTION/NG instan setelah transaksi OUT
- [ ] **AC-6 (Report):** PDF dapat difilter berdasarkan rentang tanggal / Control ID

---

## 7. HUMAN SYNC POINTS

### SYNC-1 — Schema Review (Setelah P0-1, P0-2, P0-3 selesai)
**Siapa:** Kedua Human
**Apa yang harus diperiksa:**
1. Jalankan `php artisan migrate --pretend` dan verifikasi kolom tabel.
2. Konfirmasi bahwa `status` enum (OK/ATTENTION/NG) sudah benar.
3. Setujui PR `feat/be-schema-spareparts` dan `feat/be-model-sparepart` sebelum Phase 1 dimulai.

**Gate:** Jika schema belum disetujui, Worker-BE dan Worker-FE **TIDAK BOLEH** membuat fitur baru.

### SYNC-2 — Integration Review (Setelah Phase 1 selesai)
**Siapa:** Kedua Human
**Apa yang harus diperiksa:**
1. Test alur OUT Control di device mobile sesungguhnya.
2. Test QR Scan menggunakan kamera smartphone.
3. Download laporan PDF dan bandingkan dengan template Word.
4. Verifikasi bahwa status badge berubah otomatis setelah stok di bawah safety stock.

**Gate:** Kedua human harus memberikan **Approval** secara eksplisit sebelum merge `backend` + `frontend` → `main`.

---

## 8. FILE STRUCTURE TARGET (End State)

```
app/
├── Actions/
│   └── Fortify/                    ← existing, jangan diubah
├── Events/
│   └── StockUpdated.php            ← [NEW-BE]
├── Http/
│   ├── Controllers/
│   │   ├── Settings/               ← existing, jangan diubah
│   │   ├── SparepartController.php ← [NEW-BE] Resource
│   │   ├── Stock/
│   │   │   ├── StockOutController.php← [NEW-BE]
│   │   │   └── StockInController.php← [NEW-BE]
│   │   ├── QrCodeController.php    ← [NEW-BE]
│   │   └── ReportController.php    ← [NEW-BE]
│   └── Requests/
│       ├── StoreSparepartRequest.php← [NEW-BE]
│       ├── UpdateSparepartRequest.php← [NEW-BE]
│       ├── StockOutRequest.php     ← [NEW-BE]
│       └── StockInRequest.php      ← [NEW-BE]
├── Models/
│   ├── User.php                    ← existing
│   ├── Sparepart.php               ← [NEW-BE]
│   ├── ActivityLog.php             ← [NEW-BE]
│   ├── Brand.php                   ← [NEW-BE]
│   ├── Category.php                ← [NEW-BE]
│   ├── Rack.php                    ← [NEW-BE]
│   ├── Bin.php                     ← [NEW-BE]
│   └── Traits/
│       └── HasStockStatus.php      ← [NEW-BE]
└── Observers/
    └── SparepartObserver.php       ← [NEW-BE]

resources/js/
├── components/
│   ├── ui/                         ← existing Shadcn components
│   ├── features/
│   │   ├── StockStatusBadge.tsx    ← [NEW-FE]
│   │   ├── ActivityLogTable.tsx    ← [NEW-FE]
│   │   └── QrScannerCamera.tsx     ← [NEW-FE]
│   └── ... (existing layout components)
├── pages/
│   ├── auth/                       ← existing
│   ├── settings/                   ← existing
│   ├── dashboard.tsx               ← [MODIFY-FE] tambahkan summary cards
│   ├── spareparts/
│   │   ├── Index.tsx               ← [NEW-FE]
│   │   ├── Create.tsx              ← [NEW-FE]
│   │   ├── Show.tsx                ← [NEW-FE]
│   │   └── Edit.tsx                ← [NEW-FE]
│   ├── stock/
│   │   ├── Out.tsx                 ← [NEW-FE]
│   │   └── In.tsx                  ← [NEW-FE]
│   ├── scanner/
│   │   └── Index.tsx               ← [NEW-FE]
│   ├── labels/
│   │   └── Show.tsx                ← [NEW-FE]
│   └── reports/
│       └── Index.tsx               ← [NEW-FE]
└── types/
    └── wms.d.ts                    ← [NEW-FE] TypeScript interfaces
```

---

## 9. DEPENDENCY NOTES (npm yang perlu ditambah)

| Package | Kegunaan | Siapa yang Install |
|---|---|---|
| `html5-qrcode` | QR Scanner camera | Worker-FE |
| `simplesoftwareio/simple-qrcode` | Generate QR Code di PHP | Worker-BE (via composer) |
| `barryvdh/laravel-dompdf` | Generate PDF | Worker-BE (via composer) |

Cara install (Worker-BE):
```bash
composer require simplesoftwareio/simple-qrcode
composer require barryvdh/laravel-dompdf
```

Cara install (Worker-FE):
```bash
npm install html5-qrcode
```
