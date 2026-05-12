
# 📋 VALEO WMS — Master Blueprint (plan.md)
> **Single Source of Truth** untuk semua Agent dan Human. Baca dokumen ini **sebelum** menulis satu baris kode pun.
> Dibuat oleh: Planner Agent | Terakhir diperbarui: 2026-05-12 (Forensic Audit Update)

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
| QR Code | Backend: BaconQrCode (on-demand SVG) — lihat Issue #35 untuk resolusi |
| PDF | Backend: barryvdh/laravel-dompdf ^3.1 ✅ installed |
| State/Form | Inertia `useForm` hook |
| Routes (FE) | Laravel Wayfinder (auto-generated) |

### 1.3 Core Constraints (WAJIB DIIKUTI)
- **Backend:** Maksimal **300 baris** per file PHP. Gunakan `Trait`, `Observer`, `Action Class` untuk dekomposisi.
- **Frontend:** Maksimal **500 baris** per file React/TSX.
- **DILARANG:** Membuat folder `Services/` atau `Repositories/`. Gunakan `Query Scopes`, `Action Classes`, `Jobs`, `Listeners`.
- **Pattern:** "The Laravel Way" — Thin Controller, Fat Model via Traits & Observers.
- **Validasi:** WAJIB di `FormRequest`, bukan di Controller.

---

## 2. FORENSIC AUDIT — Recovery Status (2026-05-12)

> **Mandat:** Code is the only source of truth. Status di bawah berdasarkan validasi langsung terhadap file di repository.

### 2.1 Recovery Status Table

| Task ID | Judul | Status GitHub | Status Kode | Verdict |
|---|---|---|---|---|
| P0-1 | Migrations (spareparts & activity_logs) | CLOSED | ✅ Ada & lengkap | **DONE** |
| P0-2 | Sparepart Model + HasStockStatus + Observer | CLOSED | ✅ Ada & lengkap | **DONE** |
| P0-3 | ActivityLog Model | CLOSED | ✅ Ada & lengkap | **DONE** |
| SYNC-1 | Schema Review Gate | CLOSED | ✅ Passed | **DONE** |
| B-1 | FormRequests (Store/Update Sparepart) | CLOSED | ✅ Ada (2 file) | **DONE** |
| B-2 | SparepartController (CRUD) | CLOSED | ✅ Ada, 116 baris | **DONE** |
| B-3 | FormRequests (StockIn/StockOut) | CLOSED | ✅ Ada (2 file) | **DONE** |
| B-4 | StockController (in/out logic) | CLOSED | ✅ Ada, 105 baris | **DONE** ⚠️ Issue #33 |
| B-5 | QrCodeController (on-demand) | CLOSED | ✅ Ada, 34 baris | **DONE** ⚠️ Issue #35 |
| B-6 | ReportController (filter + PDF) | CLOSED | ✅ Ada, 51 baris | **DONE** |
| B-7 | Update routes/web.php | CLOSED | ✅ Semua route terdaftar | **DONE** |
| F-1 | Sidebar Navigation + WMS Types | CLOSED | ✅ Ada + wms.d.ts | **DONE** |
| F-2 | spareparts/index.tsx | CLOSED | ✅ Ada, 5571 bytes | **DONE** |
| F-3 | spareparts/create.tsx | CLOSED | ✅ Ada, 82 baris | **DONE** |
| F-4 | spareparts/show.tsx | CLOSED | ✅ Ada, 239 baris | **DONE** |
| F-5 | spareparts/edit.tsx | CLOSED | ✅ Ada | **DONE** |
| F-6 | stock/out.tsx | CLOSED | ✅ Ada | **DONE** |
| F-7 | stock/in.tsx | CLOSED | ✅ Ada | **DONE** |
| F-8 | scanner/Index.tsx | OPEN | ✅ Ada, perlu verifikasi | **PARTIAL** |
| F-9 | labels/Show.tsx | OPEN | ✅ Ada, ada bug logic | **PARTIAL** ⚠️ Issue #32 |
| F-10 | reports/Index.tsx | OPEN | ✅ Ada, perlu verifikasi | **PARTIAL** |
| Dashboard | dashboard.tsx summary cards | - | ❌ Masih placeholder | **TODO** Issue #34 |

### 2.2 Bug / Refactor Backlog (Ditemukan saat Audit)

| Issue # | Jenis | Deskripsi | Pemilik | Prioritas |
|---|---|---|---|---|
| #32 | refactor | Labels/Show.tsx: QR logic masih pakai `qr_code_path` (static) padahal BE sudah on-demand SVG | Worker-FE | 🔴 High |
| #33 | refactor | StockController: `control_id` di-generate manual di Controller, seharusnya di Model `boot()` | Worker-BE | 🟡 Medium |
| #34 | refactor | Dashboard masih placeholder, belum ada WMS summary cards | Worker-FE | 🟡 Medium |
| #35 | bug | QrCodeController pakai BaconQrCode yang tidak di-declare di `composer.json` | Worker-BE | 🔴 High |
| #36 | integration | Phase 2: End-to-End Integration Testing (I-1~I-4) | BE + FE | 🔴 High |

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
created_at, updated_at
```

> ⚠️ **CATATAN AUDIT:** Kolom `qr_code_path` **TIDAK ADA** di migration maupun di spareparts table. Field ini dihapus dari arsitektur (QR sekarang on-demand). Worker FE wajib hapus referensi `qr_code_path` dari TypeScript interface dan semua halaman.

### Tabel: `activity_logs`
```
id, sparepart_id (FK), user_id (FK), control_id (string unique — auto-generated via Model boot()),
type (enum: IN, OUT), quantity (int), 
remarks (string nullable), po_number (string nullable — untuk IN),
gr_date (date nullable — untuk IN), price_per_unit (decimal nullable — untuk IN),
performed_at (timestamp), created_at, updated_at
```

> **ATURAN:** `status` pada `spareparts` **tidak boleh disimpan manual**. Kalkulasi dilakukan di `SparePartObserver` setiap ada mutasi pada `actual_stock`. ✅ Sudah diimplementasikan.
> **ATURAN:** `control_id` pada `activity_logs` **harus ter-generate di Model `boot()`**, bukan di Controller. ⚠️ Belum diimplementasikan — lihat Issue #33.

---

## 4. PARALLEL ROADMAP (Updated — Phase 2 Focus)

> 🟦 = Worker-Backend | 🟩 = Worker-Frontend | 🔴 = Blocker | 👤 = Human Action Required
> ✅ = VERIFIED done di kode | ⚠️ = Ada tapi perlu fix | ❌ = Belum ada

### Phase 0 — Foundation ✅ COMPLETE
| # | Task | Status |
|---|---|---|
| P0-1 | Migrations: spareparts, activity_logs | ✅ DONE |
| P0-2 | Sparepart model + HasStockStatus + Observer | ✅ DONE |
| P0-3 | ActivityLog model | ✅ DONE |
| SYNC-1 | Human Schema Review | ✅ DONE |

### Phase 1 — Backend Core ✅ COMPLETE (minor bugs)
| # | Task | Status | Issue |
|---|---|---|---|
| B-1 | FormRequests: StoreSparepart, UpdateSparepart | ✅ DONE | - |
| B-2 | SparepartController (Resource CRUD) | ✅ DONE | - |
| B-3 | FormRequests: StockOut, StockIn | ✅ DONE | - |
| B-4 | StockController (in/out logic) | ✅ DONE | ⚠️ #33 control_id |
| B-5 | QrCodeController (on-demand SVG) | ✅ DONE | ⚠️ #35 dependency |
| B-6 | ReportController (filter + PDF export) | ✅ DONE | - |
| B-7 | routes/web.php (semua WMS routes) | ✅ DONE | - |

### Phase 1 — Frontend Core ✅ COMPLETE (minor bugs)
| # | Task | Status | Issue |
|---|---|---|---|
| F-1 | Sidebar nav + wms.d.ts TypeScript types | ✅ DONE | - |
| F-2 | spareparts/index.tsx | ✅ DONE | - |
| F-3 | spareparts/create.tsx | ✅ DONE | - |
| F-4 | spareparts/show.tsx | ✅ DONE | - |
| F-5 | spareparts/edit.tsx | ✅ DONE | - |
| F-6 | stock/out.tsx | ✅ DONE | - |
| F-7 | stock/in.tsx | ✅ DONE | - |
| F-8 | scanner/Index.tsx | ⚠️ PARTIAL | Perlu verifikasi mobile |
| F-9 | labels/Show.tsx | ⚠️ PARTIAL | 🔴 #32 logic bug |
| F-10 | reports/Index.tsx | ⚠️ PARTIAL | Perlu verifikasi PDF export |
| - | dashboard.tsx summary cards | ❌ TODO | #34 |

### Phase 2 — Bug Fix Sprint (SEKARANG — Prioritas Utama)
| # | Task | Agent | Issue | Prioritas |
|---|---|---|---|---|
| FIX-1 | Resolve BaconQrCode → simplesoftwareio/simple-qrcode | 🟦 BE | #35 | 🔴 Blocker |
| FIX-2 | Refactor `control_id` ke `ActivityLog::boot()` | 🟦 BE | #33 | 🟡 Medium |
| FIX-3 | Refactor `labels/Show.tsx` — hapus logika `qr_code_path` | 🟩 FE | #32 | 🔴 Blocker |
| FIX-4 | Implementasi Dashboard summary cards | 🟩 FE | #34 | 🟡 Medium |

### Phase 2 — Integration Testing (Setelah Bug Fix Sprint)
| # | Task | Agent | Issue | Prerequisite |
|---|---|---|---|---|
| I-1 | Wire FE forms ke BE endpoints (verifikasi Wayfinder routes) | 🟩 FE | #36 | FIX-1, FIX-3 |
| I-2 | Test alur OUT Control end-to-end | 🟦+🟩 | #36 | I-1 |
| I-3 | Test alur IN Control end-to-end | 🟦+🟩 | #36 | I-1 |
| I-4 | Test QR scan → auto-redirect ke Show page | 🟩 FE | #36 | FIX-1, FIX-3 |
| SYNC-2 | 👤 Human Integration Review | 👤 Human | #17 | I-1..I-4 + semua FIX |
| I-5 | Final PR: merge `backend` → `main`, merge `frontend` → `main` | 👤 Human | - | SYNC-2 |

---

## 5. INTEGRATION POINTS (Critical Contracts)

### 5.1 QR Code Flow (Setelah Issue #35 resolved)
```
[FE] labels/Show.tsx
  └── Link href={spareparts.label(sparepart.id)}  ← GET /spareparts/{id}/label
        └── [BE] QrCodeController@show
              └── Generate fresh SVG via simplesoftwareio
              └── Pass 'qrCodeSvg' prop ke Inertia
        └── [FE] Render <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
              └── Button "Cetak" → window.print() (langsung aktif, tidak perlu generate dulu)
```

### 5.2 PDF Report Flow
```
[FE] reports/Index.tsx
  └── Button Export → GET /reports/export?from=...&to=...&type=...
        └── [BE] ReportController@export
              └── ActivityLog::filter($filters)->get()
              └── Pdf::loadView('reports.pdf', [...])
              └── return $pdf->download('WMS_Activity_Report_*.pdf')
```

### 5.3 Stock Control Flow (Observer chain)
```
[FE] stock/out.tsx → POST /stock/out/{sparepart}
  └── [BE] StockController@out
        └── DB::transaction()
              └── $sparepart->update(['actual_stock' => ...])  ← trigger Observer
              └── ActivityLog::create([...])  ← control_id auto via boot()
              └── SparepartObserver@saving → calculateStockStatus()
        └── redirect()->route('spareparts.show', $sparepart)
  └── [FE] Inertia redirect → show.tsx dengan status badge terupdate
```

---

## 6. AGENT COMMAND CENTER

### 🟦 WORKER-BACKEND — Priority Order (2026-05-12)

**Kerjakan sesuai urutan:**

**1. Issue #35 — FIX BaconQrCode dependency (BLOCKER)**
```bash
composer require simplesoftwareio/simple-qrcode
```
Kemudian refactor `QrCodeController.php`:
```php
use SimpleSoftwareIO\QrCode\Facades\QrCode;

public function show(Sparepart $sparepart)
{
    $qrCodeSvg = QrCode::format('svg')->size(200)->generate($sparepart->material_number);
    
    return Inertia::render('labels/Show', [
        'sparepart' => $sparepart->load(['brand', 'category', 'bin.rack']),
        'qrCodeSvg' => $qrCodeSvg,
    ]);
}
```

**2. Issue #33 — Pindahkan `control_id` ke `ActivityLog::boot()`**
Di `app/Models/ActivityLog.php`, tambahkan:
```php
protected static function boot(): void
{
    parent::boot();
    static::creating(function (ActivityLog $log) {
        if (empty($log->control_id)) {
            $log->control_id = 'CTL-' . strtoupper(Str::random(8));
        }
    });
}
```
Kemudian hapus baris `'control_id' => 'CTL-...'` dari `StockController`.

**3. Setelah FIX selesai → Bantu verifikasi Integration Testing (Issue #36)**

**Larangan keras (tetap berlaku):**
- Jangan sentuh file di `resources/js/`
- Jangan sentuh file di `app/Http/Controllers/Settings/`
- Jangan buat folder `Services/` atau `Repositories/`

---

### 🟩 WORKER-FRONTEND — Priority Order (2026-05-12)

**Kerjakan sesuai urutan:**

**1. Issue #32 — Refactor `labels/Show.tsx` (BLOCKER)**

Ganti logika yang bergantung pada `qr_code_path` menjadi langsung render `qrCodeSvg` prop:
```tsx
// HAPUS: handleGenerateQR(), handlePrint() check, button "Generate QR"
// GANTI: render qrCodeSvg langsung, tombol Cetak selalu aktif

export default function LabelShow({ sparepart, qrCodeSvg }: LabelShowProps) {
    const handlePrint = () => window.print();

    return (
        <>
            {/* ... header buttons ... */}
            <div 
                className="w-full h-full p-4 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }} 
            />
        </>
    );
}
```

Juga hapus `qr_code_path` dari:
- `resources/js/types/wms.d.ts` interface `Sparepart`
- `resources/js/pages/spareparts/show.tsx` baris 123 (`DetailItem label="QR Code"`)

**2. Issue #34 — Dashboard summary cards**

Update `routes/web.php` untuk pass summary ke dashboard:
```php
Route::inertia('dashboard', 'dashboard', [
    'summary' => fn() => [
        'total' => Sparepart::count(),
        'ok' => Sparepart::where('status', 'OK')->count(),
        'attention' => Sparepart::where('status', 'ATTENTION')->count(),
        'ng' => Sparepart::where('status', 'NG')->count(),
    ],
    'recentLogs' => fn() => ActivityLog::with(['sparepart', 'user'])
        ->latest('performed_at')->limit(5)->get(),
])->name('dashboard');
```

Update `dashboard.tsx` untuk pakai `SparePartsSummaryCards` dan `ActivityLogTable`.

**3. Verifikasi Issues #14, #15, #16** — Test manual di browser setelah FIX-1 dan FIX-3 selesai.

**Larangan keras (tetap berlaku):**
- Jangan sentuh file PHP di `app/`
- Jangan sentuh file `routes/` (kecuali yang disebutkan di FIX-4)
- Gunakan `useForm` dari Inertia untuk semua form

---

### 🔍 REVIEWER AGENT — Checklist (Updated)

#### Checklist Backend PR
- [ ] Migrasi memiliki kolom yang sesuai dengan schema Section 3
- [ ] Observer menghitung `status` otomatis (tidak ada kalkulasi status di Controller)
- [ ] Validasi ada di FormRequest (bukan di Controller body)
- [ ] Controller tidak melebihi 300 baris
- [ ] Tidak ada folder `Services/` atau `Repositories/` yang dibuat
- [ ] `control_id` di `activity_logs` ter-generate otomatis di **`ActivityLog::boot()`** (Issue #33)
- [ ] Route terdaftar di `routes/web.php` dalam group `auth` middleware
- [ ] `composer.json` mencantumkan semua direct dependencies (Issue #35)

#### Checklist Frontend PR
- [ ] Semua props memiliki TypeScript interface
- [ ] Form menggunakan `useForm` dari Inertia
- [ ] File tidak melebihi 500 baris
- [ ] Status badge menampilkan emoji yang benar (😮 = ATTENTION, 😡 = NG, ✅ = OK)
- [ ] Komponen UI menggunakan Shadcn (bukan elemen HTML mentah)
- [ ] `cn()` digunakan untuk penggabungan class Tailwind
- [ ] **Tidak ada referensi `qr_code_path`** di komponen manapun (Issue #32)

#### Checklist Acceptance Criteria
- [ ] **AC-1 (Master Data):** Form sparepart menyimpan semua 9 field
- [ ] **AC-2 (QR):** QR Code berisi Material Number, Location, Brand, Specification
- [ ] **AC-3 (Scanner):** Auto-redirect ke halaman detail setelah scan berhasil
- [ ] **AC-4 (OUT):** Stok berkurang real-time setelah konfirmasi, log tercatat otomatis
- [ ] **AC-5 (Status):** Status berubah ke ATTENTION/NG instan setelah transaksi OUT
- [ ] **AC-6 (Report):** PDF dapat difilter berdasarkan rentang tanggal / Control ID

---

## 7. HUMAN SYNC POINTS

### SYNC-1 — Schema Review ✅ COMPLETED
Dilaksanakan pada Phase 0. Schema disetujui.

### SYNC-2 — Integration Review (Issue #17) ⏳ HOLD
**Status:** ON HOLD — menunggu penyelesaian Issues #32, #33, #34, #35, #36.

**Gate:** Semua issue di bawah harus CLOSED sebelum SYNC-2 bisa dilaksanakan:
- [ ] Issue #32 — Refactor Labels/Show.tsx
- [ ] Issue #33 — Refactor control_id ke Model boot
- [ ] Issue #34 — Dashboard summary cards
- [ ] Issue #35 — BaconQrCode dependency fix
- [ ] Issue #36 — Integration Testing selesai

**Setelah semua CLOSED, Human perlu:**
1. Test alur OUT Control di device mobile sesungguhnya.
2. Test QR Scan menggunakan kamera smartphone.
3. Download laporan PDF dan bandingkan dengan template Word.
4. Verifikasi bahwa status badge berubah otomatis setelah stok di bawah safety stock.

---

## 8. FILE STRUCTURE — Current State

```
app/
├── Actions/
│   └── Fortify/                    ← existing ✅
├── Http/
│   ├── Controllers/
│   │   ├── Settings/               ← existing ✅
│   │   ├── SparepartController.php ← DONE ✅ (116 baris)
│   │   ├── StockController.php     ← DONE ✅ (105 baris) ⚠️ Issue #33
│   │   ├── QrCodeController.php    ← DONE ✅ (34 baris) ⚠️ Issue #35
│   │   └── ReportController.php    ← DONE ✅ (51 baris)
│   └── Requests/
│       ├── StoreSparepartRequest.php  ← DONE ✅
│       ├── UpdateSparepartRequest.php ← DONE ✅
│       ├── StockOutRequest.php        ← DONE ✅
│       └── StockInRequest.php         ← DONE ✅
├── Models/
│   ├── User.php                    ← existing ✅
│   ├── Sparepart.php               ← DONE ✅
│   ├── ActivityLog.php             ← DONE ✅ ⚠️ perlu boot() untuk Issue #33
│   ├── Brand.php                   ← DONE ✅
│   ├── Category.php                ← DONE ✅
│   ├── Rack.php                    ← DONE ✅
│   ├── Bin.php                     ← DONE ✅
│   └── Traits/
│       └── HasStockStatus.php      ← DONE ✅
└── Observers/
    └── SparepartObserver.php       ← DONE ✅

resources/js/
├── components/
│   ├── features/
│   │   ├── spareparts/
│   │   │   ├── sparepart-form.tsx         ← DONE ✅
│   │   │   ├── spareparts-filters.tsx     ← DONE ✅
│   │   │   ├── spareparts-summary-cards.tsx ← DONE ✅
│   │   │   ├── spareparts-table.tsx       ← DONE ✅
│   │   │   ├── spareparts-utils.ts        ← DONE ✅
│   │   │   └── stock-status-badge.tsx     ← DONE ✅
│   │   ├── stock/
│   │   │   ├── activity-log-table.tsx     ← DONE ✅
│   │   │   └── stock-transaction-form.tsx ← DONE ✅
│   │   └── reports/
│   │       ├── ReportFilters.tsx          ← DONE ✅
│   │       ├── ReportHeader.tsx           ← DONE ✅
│   │       └── ReportPreviewTable.tsx     ← DONE ✅
│   └── QrScannerCamera.tsx              ← DONE ✅
├── pages/
│   ├── dashboard.tsx               ← ❌ Perlu update (Issue #34)
│   ├── spareparts/
│   │   ├── index.tsx               ← DONE ✅
│   │   ├── create.tsx              ← DONE ✅
│   │   ├── show.tsx                ← DONE ✅ (hapus qr_code_path ref)
│   │   └── edit.tsx                ← DONE ✅
│   ├── stock/
│   │   ├── out.tsx                 ← DONE ✅
│   │   └── in.tsx                  ← DONE ✅
│   ├── scanner/
│   │   └── Index.tsx               ← DONE ✅ (perlu verifikasi mobile)
│   ├── labels/
│   │   └── Show.tsx                ← ⚠️ Perlu refactor (Issue #32)
│   └── reports/
│       └── Index.tsx               ← DONE ✅ (perlu verifikasi PDF export)
└── types/
    └── wms.d.ts                    ← DONE ✅ (hapus qr_code_path field)
```

---

## 9. DEPENDENCY NOTES

### Composer (PHP)
| Package | Versi | Status |
|---|---|---|
| `barryvdh/laravel-dompdf` | ^3.1 | ✅ Installed |
| `simplesoftwareio/simple-qrcode` | - | ❌ Belum install — Issue #35 |
| `bacon/bacon-qr-code` | - | ⚠️ Dipakai via transitive dep, tidak di-declare |

### NPM (JavaScript)
| Package | Versi | Status |
|---|---|---|
| `html5-qrcode` | ^2.3.8 | ✅ Installed |
| `react-day-picker` | ^8.10.1 | ✅ Installed |
| `date-fns` | ^4.1.0 | ✅ Installed |
| `sonner` | ^2.0.0 | ✅ Installed |

---

## 10. NEXT ACTION COMMAND

### 🟦 Worker-Backend — Jalankan sekarang:
```
1. Checkout branch: git checkout backend
2. git checkout -b fix/be-qrcode-dependency
3. composer require simplesoftwareio/simple-qrcode
4. Refactor QrCodeController.php (lihat Section 6)
5. PR ke branch backend → tag Issue #35
6. Kemudian buat branch fix/be-activitylog-boot
7. Tambah boot() ke ActivityLog.php (lihat Section 6)
8. Hapus control_id manual dari StockController
9. PR ke branch backend → tag Issue #33
```

### 🟩 Worker-Frontend — Jalankan sekarang:
```
1. Checkout branch: git checkout frontend
2. git checkout -b fix/fe-label-qr-logic
3. Refactor resources/js/pages/labels/Show.tsx (lihat Section 6)
4. Hapus qr_code_path dari wms.d.ts dan spareparts/show.tsx baris 123
5. PR ke branch frontend → tag Issue #32
6. Kemudian buat branch feat/fe-dashboard-summary
7. Update dashboard.tsx + modifikasi routes/web.php untuk pass summary data
8. PR ke branch frontend → tag Issue #34
```

### Setelah semua FIX selesai:
```
Worker-BE + Worker-FE: Kerjakan Issue #36 (Integration Testing)
Laporkan hasil ke Human untuk SYNC-2 (Issue #17)
```
