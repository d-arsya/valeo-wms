<?php

namespace Database\Seeders;

use App\Models\Bin;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Rack;
use App\Models\Sparepart;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

/**
 * Production Seeder: Import master data SPAREPART dari file Excel XLSX.
 * SPAREPART adalah ENTRY POINT UTAMA: Brand/Category/Rack/Bin DIBUAT OTOMATIS
 * saat import sparepart (firstOrCreate) jika belum ada di database.
 *
 * File path default: base_path('ImportData/WarehouseManagementSystem_A23.xlsx')
 * Sheet: "Master List" (index 1), Header Row 13, Data mulai Row 14
 *
 * KONFIGURASI (set public property sebelum run, atau override langsung):
 *   $onlyFirst82 = true   -> DEFAULT: hanya import A23000001 s.d A23000082 (data ASLI VALID)
 *   $wipeBeforeRun = true -> DEFAULT: HAPUS SEMUA data 5 master tabel + activity log SEBELUM import (agar data production BERSIH tanpa sisa factory/data salah)
 *
 * IDEMPOTENT: Bisa di-run BERKALI-KALI tanpa duplicate.
 * Usage:
 *   php artisan db:seed --class=ProductionFromXlsxSeeder
 */
class ProductionFromXlsxSeeder extends Seeder
{
    protected const XLSX_PATH = 'ImportData/WarehouseManagementSystem_A23.xlsx';
    protected const SHEET_INDEX = 1;
    protected const HEADER_ROW = 13;
    protected const FIRST_DATA_ROW = 14;

    /**
     * ------------------------------------------------------------------
     * 🔧 KONFIGURASI UTAMA (SESUAIKAN DENGAN KEBUTUHAN PRODUCTION):
     * ------------------------------------------------------------------
     */
    public bool $onlyFirst782 = true;  // DEFAULT: IMPORT SAMPE A23000782 (782 DATA ASLI)
    public bool $wipeBeforeRun = true; // CLEAN DB TOTAL sebelum import (fresh data)
    public int $maxSuffixLimit = 782;  // Batas suffix numeric akhir material

    /** Prefix Material Number (biasanya A230...) untuk deteksi suffix numeric */
    public string $materialPrefix = 'A230';

    /** @var array Cache */
    protected array $brandCache = [];
    protected array $categoryCache = [];
    protected array $rackCache = [];
    protected array $binCache = [];

    /** Stats */
    protected int $newBrands = 0;
    protected int $newCategories = 0;
    protected int $newRacks = 0;
    protected int $newBins = 0;
    protected int $newSpareparts = 0;
    protected int $updatedSpareparts = 0;
    protected int $skippedRows = 0;
    protected int $filteredRows = 0; // skip karena >82 / format invalid

    public function run(): void
    {
        $fullPath = base_path(self::XLSX_PATH);

        if (! file_exists($fullPath)) {
            $this->command->error("❌ File XLSX tidak ditemukan: {$fullPath}");
            $this->command->warn("   Pastikan file berada di: " . base_path('ImportData'));
            return;
        }

        // =============================
        // 🔥 STEP 0: CLEAN DB JIKA DIMINTA
        // =============================
        if ($this->wipeBeforeRun) {
            $this->wipeDatabaseForFreshImport();
        }

        $this->command->info("📄 Loading XLSX: " . basename($fullPath));
        if ($this->onlyFirst782) {
            $this->command->warn("   🎯 MODE: IMPORT DATA ASLI SAMPE suffix #{$this->maxSuffixLimit} (A23000001 ~ A23000{$this->maxSuffixLimit})");
        } else {
            $this->command->warn("   ⚠️  MODE: IMPORT SEMUA DATA (full sheet)");
        }

        $spreadsheet = IOFactory::load($fullPath);
        $sheet = $spreadsheet->getSheet(self::SHEET_INDEX);
        $sheetName = $sheet->getTitle();
        $highestRow = $sheet->getHighestRow();

        $totalRows = max(0, $highestRow - self::HEADER_ROW);
        $this->command->info("✅ Sheet: {$sheetName} | Total Data rows: {$totalRows} (Row " . self::FIRST_DATA_ROW . " - {$highestRow})");

        DB::transaction(function () use ($sheet, $highestRow) {
            $this->processAllRows($sheet, $highestRow);
        });

        $this->printSummary();
    }

    /**
     * Hapus semua data di 5 master tabel + activity log CASCADE.
     * Order delete sesuai foreign key constraint (dari child ke parent).
     * Disable FK check sementara untuk kecepatan.
     */
    protected function wipeDatabaseForFreshImport(): void
    {
        $this->command->warn("🧹 WIPE BEFORE RUN: Membersihkan 5 tabel master & activity log...");
        Schema::disableForeignKeyConstraints();
        try {
            $deletedActivity = ActivityLog::count(); ActivityLog::truncate();
            $deletedSpare = Sparepart::count();    Sparepart::truncate();
            $deletedBin = Bin::count();            Bin::truncate();
            $deletedRack = Rack::count();          Rack::truncate();
            $deletedBrand = Brand::count();        Brand::truncate();
            $deletedCat = Category::count();       Category::truncate();

            $this->command->warn("   → Activity Log: {$deletedActivity} row dihapus");
            $this->command->warn("   → Spareparts: {$deletedSpare} row dihapus");
            $this->command->warn("   → Bins: {$deletedBin} row dihapus");
            $this->command->warn("   → Racks: {$deletedRack} row dihapus");
            $this->command->warn("   → Brands: {$deletedBrand} row dihapus");
            $this->command->warn("   → Categories: {$deletedCat} row dihapus");
            $this->command->info("✅ Database bersih! Siap import data production.\n");
        } finally {
            Schema::enableForeignKeyConstraints();
        }
    }

    protected function processAllRows($sheet, int $highestRow): void
    {
        $progress = $this->command->getOutput()->createProgressBar(max(1, $highestRow - self::FIRST_DATA_ROW + 1));
        $progress->start();

        for ($r = self::FIRST_DATA_ROW; $r <= $highestRow; $r++) {
            $this->processSingleRow($sheet, $r);
            $progress->advance();
        }

        $progress->finish();
        $this->command->getOutput()->writeln('');
    }

    protected function processSingleRow($sheet, int $rowNum): void
    {
        // ===========================
        // BACA SEL DATA DARI XLSX
        // ===========================
        $materialNumber = trim((string) $this->cellVal($sheet, "C{$rowNum}"));

        // Skip jika material number KOSONG
        if ($materialNumber === '' || $materialNumber === '0') {
            $this->skippedRows++;
            return;
        }

        // ==============================
        // FILTER MODE: HANYA SAMPAI suffix <= 782 (DATA ASLI SAMPE A23000782)
        // Extract numeric suffix. Ex: "A23000082" → 82, "A23000782" → 782
        // ==============================
        if ($this->onlyFirst782) {
            $suffix = null;
            if (preg_match('/^' . preg_quote($this->materialPrefix, '/') . '0*(\d+)$/i', $materialNumber, $m)) {
                $suffix = (int) $m[1];
            } elseif (preg_match('/(\d{1,6})$/i', $materialNumber, $m)) {
                $suffix = (int) ltrim($m[1], '0') ?: 0;
            }
            if ($suffix === null || $suffix === 0 || $suffix > $this->maxSuffixLimit) {
                $this->filteredRows++;
                return;
            }
        }

        // D = Location Rack Number (contoh: A1.1 → Rack="A", Bin="1.1")
        $locationRaw = trim((string) $this->cellVal($sheet, "D{$rowNum}"));
        // E = Part Name | F = Specification | G = Brand | H = Category
        $partName = trim((string) $this->cellVal($sheet, "E{$rowNum}"));
        $specification = trim((string) $this->cellVal($sheet, "F{$rowNum}"));
        $brandName = trim((string) $this->cellVal($sheet, "G{$rowNum}"));
        $categoryName = trim((string) $this->cellVal($sheet, "H{$rowNum}"));
        // I = Safety Stock | J = WH Stock (actual)
        $safetyStock = $this->toIntOrZero($this->cellVal($sheet, "I{$rowNum}"));
        $whStock = $this->toIntOrZero($this->cellVal($sheet, "J{$rowNum}"));
        // L = Unit (tidak tersimpan ke DB - nanti bisa ditambahkan di spec)
        // N = Last PO Number | O = Last PO Supplier
        $lastPoNumber = trim((string) $this->cellVal($sheet, "N{$rowNum}"));
        $lastSupplier = trim((string) $this->cellVal($sheet, "O{$rowNum}"));
        // P = GR Date
        $grDateRaw = $sheet->getCell("P{$rowNum}");
        $grDate = $this->parseDate($grDateRaw);
        // Q = Value per pcs
        $pricePerUnit = $this->toFloatOrZero($this->cellVal($sheet, "Q{$rowNum}"));
        // S = Rank (A/B/C)
        $rankRaw = strtoupper(trim((string) $this->cellVal($sheet, "S{$rowNum}")));
        $rank = in_array($rankRaw, ['A', 'B', 'C'], true) ? $rankRaw : null;
        // T = Status text (OK / ATTENTION / NG)
        $statusRaw = strtoupper(trim((string) $this->cellVal($sheet, "T{$rowNum}")));

        // ===========================
        // BUAT / DAPATKAN MASTER DATA
        // SEMUA WAJIB ADA KARENA FOREIGN KEY CONSTRAINED (NOT NULL!)
        // ===========================
        if ($brandName === '') { $brandName = 'General / Lainnya'; }
        if ($categoryName === '') { $categoryName = 'Umum'; }
        $brandId = $this->resolveBrand($brandName);
        $categoryId = $this->resolveCategory($categoryName);

        if ($locationRaw === '') { $locationRaw = 'LOC-UNKNOWN-' . $rowNum; }
        $binId = $this->resolveBin($locationRaw);
        if ($binId === null) {
            $binId = $this->resolveBin('LOC-STOCKROOM');
        }

        // Status enum: HANYA BOLEH ['OK', 'ATTENTION', 'NG'] (migration enum strict!)
        $status = in_array($statusRaw, ['OK', 'ATTENTION', 'NG'], true) ? $statusRaw : 'OK';
        // Rank char(1) NOT NULL, default C jika tidak ada
        $rank = $rank ?? 'C';

        $sparepartData = [
            'material_number' => $materialNumber,
            'part_name' => $partName !== '' ? $partName : "{$materialNumber}",
            'specification' => $specification,
            'brand_id' => $brandId,
            'category_id' => $categoryId,
            'bin_id' => $binId,
            'safety_stock' => $safetyStock,
            'actual_stock' => $whStock,
            'last_po_number' => $lastPoNumber !== '' ? $lastPoNumber : null,
            'last_supplier' => $lastSupplier !== '' ? $lastSupplier : null,
            'last_gr_date' => $grDate,
            'price_per_unit' => $pricePerUnit,
            'rank' => $rank,
            'status' => $status,
        ];

        // ===========================
        // UPSERT SPAREPART (IDEMPOTENT!)
        // ===========================
        $existing = Sparepart::where('material_number', $materialNumber)->first();
        if ($existing === null) {
            Sparepart::create($sparepartData);
            $this->newSpareparts++;
        } else {
            $existing->update($sparepartData);
            $this->updatedSpareparts++;
        }
    }

    // ============= RESOLVERS (with Cache) =============

    protected function resolveBrand(?string $name): ?int
    {
        if ($name === null || $name === '') return null;
        if (isset($this->brandCache[$name])) return $this->brandCache[$name];

        $brand = Brand::firstOrCreate(['name' => $name]);
        if ($brand->wasRecentlyCreated) $this->newBrands++;
        $this->brandCache[$name] = $brand->id;
        return $brand->id;
    }

    protected function resolveCategory(?string $name): ?int
    {
        if ($name === null || $name === '') return null;
        if (isset($this->categoryCache[$name])) return $this->categoryCache[$name];

        $cat = Category::firstOrCreate(['name' => $name]);
        if ($cat->wasRecentlyCreated) $this->newCategories++;
        $this->categoryCache[$name] = $cat->id;
        return $cat->id;
    }

    protected function resolveRack(?string $rackCode): ?int
    {
        if ($rackCode === null || $rackCode === '') return null;
        if (isset($this->rackCache[$rackCode])) return $this->rackCache[$rackCode];

        $rack = Rack::firstOrCreate(['code' => $rackCode]);
        if ($rack->wasRecentlyCreated) $this->newRacks++;
        $this->rackCache[$rackCode] = $rack->id;
        return $rack->id;
    }

    /**
     * Bin Code adalah GLOBAL UNIQUE (constraint unique di table bins).
     * Jadi: Bin Code = FULL LOCATION STRING (misal "A1.1", "T3.2.8") agar unique.
     * Rack di-extract dari prefix huruf untuk grouping.
     */
    protected function resolveBin(?string $location): ?int
    {
        if ($location === null || $location === '') return null;

        if (isset($this->binCache[$location])) return $this->binCache[$location];

        // 1. Coba DAPATKAN BIN YANG SUDAH ADA dengan code = full location (unique global!)
        $existingBin = Bin::where('code', $location)->first();
        if ($existingBin !== null) {
            $this->binCache[$location] = $existingBin->id;
            return $existingBin->id;
        }

        // 2. Extract rack code prefix jika bisa (huruf depan, misal "A1.1" → Rack "A")
        $rackCode = null;
        if (preg_match('/^([A-Za-z]+)/u', $location, $m)) {
            $rackCode = strtoupper($m[1]);
        } elseif (preg_match('/^([\d]+)/', $location, $m)) {
            $rackCode = 'GEN';
        } else {
            $rackCode = 'UNKNOWN';
        }

        $rackId = $this->resolveRack($rackCode);

        // 3. UNIQUE CONSTRAINT: pattern TRY/CATCH robust firstOrCreate
        try {
            $bin = Bin::create([
                'code' => $location,
                'rack_id' => $rackId,
            ]);
            $this->newBins++;
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            // Unik constraint conflict → ambil existing
            $bin = Bin::where('code', $location)->firstOrFail();
        } catch (\Throwable $e) {
            try {
                $bin = Bin::firstOrCreate(
                    ['code' => $location],
                    ['rack_id' => $rackId]
                );
                if ($bin->wasRecentlyCreated) $this->newBins++;
            } catch (\Throwable $e2) {
                // Fallback terakhir: jika masih error, biarkan bin_id NULL
                $this->binCache[$location] = null;
                return null;
            }
        }
        $this->binCache[$location] = $bin->id;
        return $bin->id;
    }

    // ============= UTILITIES =============

    protected function cellVal($sheet, string $coord): mixed
    {
        $cell = $sheet->getCell($coord);
        $val = $cell->getValue();

        // Handle Excel formula: pakai calculated value (tapi catch error)
        if (is_string($val) && str_starts_with($val, '=')) {
            try {
                return $cell->getCalculatedValue();
            } catch (\Throwable $e) {
                return null;
            }
        }

        return $val;
    }

    protected function parseDate($cellOrValue): ?string
    {
        if ($cellOrValue === null || $cellOrValue === '') return null;

        try {
            // Jika object Cell
            if (is_object($cellOrValue) && method_exists($cellOrValue, 'getValue')) {
                $val = $cellOrValue->getValue();
                if (is_numeric($val) && ExcelDate::isDateTime($cellOrValue)) {
                    return ExcelDate::excelToDateTimeObject($val)->format('Y-m-d');
                }
                if ($val instanceof \DateTimeInterface) {
                    return Carbon::instance($val)->format('Y-m-d');
                }
                $valStr = trim((string) $val);
            } else {
                $valStr = trim((string) $cellOrValue);
            }

            if ($valStr === '') return null;

            // Try Carbon parse string format umum
            $parsed = Carbon::parse($valStr);
            if ($parsed && $parsed->year > 1990 && $parsed->year < 2100) {
                return $parsed->format('Y-m-d');
            }
        } catch (\Throwable $e) { /* silent fall */ }

        return null;
    }

    protected function toIntOrZero(mixed $v): int
    {
        if ($v === null || $v === '') return 0;
        if (is_bool($v)) return $v ? 1 : 0;
        if (is_numeric($v)) return (int) round((float) $v);
        if (is_string($v) && preg_match('/-?\d+/', preg_replace('/[.,]/', '', $v), $m)) {
            return (int) $m[0];
        }
        return 0;
    }

    protected function toFloatOrZero(mixed $v): float
    {
        if ($v === null || $v === '') return 0.0;
        if (is_bool($v)) return $v ? 1.0 : 0.0;
        if (is_numeric($v)) return (float) $v;
        if (is_string($v)) {
            $clean = preg_replace('/[^0-9.\-]/', '', $v);
            if (is_numeric($clean)) return (float) $clean;
        }
        return 0.0;
    }

    protected function printSummary(): void
    {
        $out = $this->command->getOutput();
        $out->writeln('');
        $out->writeln('<info>✅ SEEDER PRODUCTION SELESAI!</info>');
        if ($this->onlyFirst782) {
            $out->writeln("<comment>🎯 Mode LIMIT SAMPAI suffix #{$this->maxSuffixLimit} (A23000001 ~ A23000{$this->maxSuffixLimit})</comment>");
            $out->writeln(sprintf('  %-30s <comment>%d row (lebih besar / invalid)</comment>', 'Diskip (Filter Limit):', $this->filteredRows));
        }
        $out->writeln(sprintf('  %-30s <info>%d</info>', 'New Brands', $this->newBrands));
        $out->writeln(sprintf('  %-30s <info>%d</info>', 'New Categories', $this->newCategories));
        $out->writeln(sprintf('  %-30s <info>%d</info>', 'New Racks', $this->newRacks));
        $out->writeln(sprintf('  %-30s <info>%d</info>', 'New Bins', $this->newBins));
        $out->writeln(sprintf('  %-30s <info>%d</info>', 'Spareparts CREATED', $this->newSpareparts));
        $out->writeln(sprintf('  %-30s <comment>%d</comment>', 'Spareparts UPDATED', $this->updatedSpareparts));
        $out->writeln(sprintf('  %-30s %d', 'Skipped rows (kosong)', $this->skippedRows));
        $out->writeln('');
        $out->writeln('<info>📊 DB Stats Akhir:</info>');
        $out->writeln(sprintf('  %-30s %d', 'Total Brands', Brand::count()));
        $out->writeln(sprintf('  %-30s %d', 'Total Categories', Category::count()));
        $out->writeln(sprintf('  %-30s %d', 'Total Racks', Rack::count()));
        $out->writeln(sprintf('  %-30s %d', 'Total Bins', Bin::count()));
        $out->writeln(sprintf('  %-30s %d', 'Total Spareparts', Sparepart::count()));
    }
}
