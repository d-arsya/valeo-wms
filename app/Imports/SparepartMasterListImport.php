<?php

namespace App\Imports;

use App\Models\Bin;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Rack;
use App\Models\Sparepart;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SparepartMasterListImport
{
    /** Cache dictionaries to minimize DB lookups */
    protected array $brandCache = [];
    protected array $categoryCache = [];
    protected array $rackCache = [];
    protected array $binCache = [];

    /** Dynamic column mapping with sensible defaults */
    protected array $columnMap = [
        'material'      => 'C',
        'location'      => 'D',
        'part_name'     => 'E',
        'specification' => 'F',
        'brand'         => 'G',
        'category'      => 'H',
        'safety_stock'  => 'I',
        'actual_stock'  => 'J',
        'unit'          => 'L',
        'resource'      => 'M',
        'last_po'       => 'N',
        'last_supplier' => 'O',
        'gr_date'       => 'P',
        'price'         => 'Q',
        'rank'          => 'S',
    ];

    /**
     * Dry-run: parse the Excel and compute diffs without writing to the database.
     * Returns the same structure as import() but with no side-effects.
     *
     * @param string $filePath Full path to the uploaded file.
     * @param int $chunkSize Number of rows per chunk.
     * @return array Preview of what import() would do.
     * @throws Exception
     */
    public function dryRun(string $filePath, int $chunkSize = 100): array
    {
        if (! file_exists($filePath)) {
            throw new Exception('File Excel tidak ditemukan.');
        }

        @ini_set('memory_limit', '256M');
        @set_time_limit(180);

        $reader = IOFactory::createReaderForFile($filePath);
        $reader->setReadDataOnly(true);

        $worksheetInfo = $reader->listWorksheetInfo($filePath);
        $targetSheetName = null;
        foreach ($worksheetInfo as $info) {
            if (strtolower(trim($info['worksheetName'])) === 'master list') {
                $targetSheetName = $info['worksheetName'];
                break;
            }
        }
        if ($targetSheetName) {
            $reader->setLoadSheetsOnly($targetSheetName);
        }

        $spreadsheet = $reader->load($filePath);
        [$sheet, , $startRow] = $this->findAndValidateHeaderRow($spreadsheet);
        $highestRow = $sheet->getHighestRow();

        if ($highestRow < $startRow) {
            throw new Exception('Data sparepart di file Excel kosong.');
        }

        $created = 0;
        $updated = 0;
        $unchanged = 0;
        $skipped = 0;
        $createdItems = [];
        $updatedItems = [];

        $totalRows = $highestRow - $startRow + 1;
        $chunks    = (int) ceil($totalRows / $chunkSize);

        for ($c = 0; $c < $chunks; $c++) {
            $chunkStart = $startRow + ($c * $chunkSize);
            $chunkEnd   = min($highestRow, $chunkStart + $chunkSize - 1);

            for ($row = $chunkStart; $row <= $chunkEnd; $row++) {
                $materialNumber = trim((string) $this->getCellValue($sheet, "{$this->columnMap['material']}{$row}"));

                if ($materialNumber === '' || $materialNumber === '0') {
                    $skipped++;
                    continue;
                }

                $sparepartData = $this->buildSparepartData($sheet, $row, $materialNumber);

                $existing = Sparepart::where('material_number', $materialNumber)->first();

                if ($existing) {
                    // Use a temporary clone so we don't touch the DB
                    $clone = $existing->replicate();
                    $clone->setRawAttributes($existing->getAttributes());
                    $clone->syncOriginal();
                    $clone->fill($sparepartData);

                    if ($clone->isDirty()) {
                        $diffList = [];
                        foreach ($clone->getDirty() as $field => $newVal) {
                            if (in_array($field, ['updated_at', 'created_at', 'status'])) {
                                continue;
                            }
                            $oldVal = $clone->getOriginal($field);
                            if (! $this->isFieldActuallyChanged($field, $oldVal, $newVal)) {
                                continue;
                            }
                            $diffList[] = [
                                'field'    => $field,
                                'label'    => $this->humanizeField($field),
                                'oldValue' => $this->formatDisplayValue($field, $oldVal),
                                'newValue' => $this->formatDisplayValue($field, $newVal),
                            ];
                        }

                        if (! empty($diffList)) {
                            $updated++;
                            if (count($updatedItems) < 150) {
                                $updatedItems[] = [
                                    'material_number' => $materialNumber,
                                    'part_name'       => $existing->part_name,
                                    'type'            => 'updated',
                                    'changes'         => $diffList,
                                ];
                            }
                        } else {
                            $unchanged++;
                        }
                    } else {
                        $unchanged++;
                    }
                } else {
                    $created++;
                    if (count($createdItems) < 150) {
                        $createdItems[] = [
                            'material_number' => $materialNumber,
                            'part_name'       => $sparepartData['part_name'],
                            'type'            => 'created',
                            'actual_stock'    => $sparepartData['actual_stock'],
                            'safety_stock'    => $sparepartData['safety_stock'],
                            'unit'            => $sparepartData['unit'] ?? '-',
                            'price_per_unit'  => $sparepartData['price_per_unit']
                                ? number_format((float) $sparepartData['price_per_unit'], 0, ',', '.')
                                : '-',
                            'rank'            => $sparepartData['rank'],
                        ];
                    }
                }
            }

            if (function_exists('gc_collect_cycles')) {
                gc_collect_cycles();
            }
        }

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        if ($created === 0 && $updated === 0 && $unchanged === 0) {
            throw new Exception('Tidak ada data sparepart valid yang ditemukan.');
        }

        return [
            'created'        => $created,
            'updated'        => $updated,
            'unchanged'      => $unchanged,
            'skipped'        => $skipped,
            'total'          => $created + $updated + $unchanged,
            'created_items'  => $createdItems,
            'updated_items'  => $updatedItems,
            'has_more_items' => ($created + $updated) > (count($createdItems) + count($updatedItems)),
        ];
    }

    /**
     * Process import from an uploaded Excel file with chunking and memory optimization.
     *
     * @param string $filePath Full path to the uploaded file.
     * @param int $chunkSize Number of rows per chunk (default 100 for shared hosting).
     * @return array Summary of import results with detailed changes list.
     * @throws Exception
     */
    public function import(string $filePath, int $chunkSize = 100): array
    {
        if (! file_exists($filePath)) {
            throw new Exception('File Excel tidak ditemukan.');
        }

        // Shared hosting resource safety
        @ini_set('memory_limit', '256M');
        @set_time_limit(180);

        $reader = IOFactory::createReaderForFile($filePath);

        // 1. Memory Optimization: Hanya baca DATA mentah (abaikan style, font, warna, gambar)
        $reader->setReadDataOnly(true);

        // 2. Memory Optimization: Hanya muat sheet 'Master List' jika ada (hindari muat puluhan sheet layout lain)
        $worksheetInfo = $reader->listWorksheetInfo($filePath);
        $targetSheetName = null;
        foreach ($worksheetInfo as $info) {
            if (strtolower(trim($info['worksheetName'])) === 'master list') {
                $targetSheetName = $info['worksheetName'];
                break;
            }
        }

        if ($targetSheetName) {
            $reader->setLoadSheetsOnly($targetSheetName);
        }

        $spreadsheet = $reader->load($filePath);

        // 3. Strict Header Validation
        [$sheet, $headerRow, $startRow] = $this->findAndValidateHeaderRow($spreadsheet);
        $highestRow = $sheet->getHighestRow();

        if ($highestRow < $startRow) {
            throw new Exception('Data sparepart di file Excel kosong.');
        }

        $created = 0;
        $updated = 0;
        $unchanged = 0;
        $skipped = 0;

        $createdItems = [];
        $updatedItems = [];

        // 4. Wrap in DB Transaction for All-or-Nothing integrity
        DB::transaction(function () use (
            $sheet,
            $startRow,
            $highestRow,
            $chunkSize,
            &$created,
            &$updated,
            &$unchanged,
            &$skipped,
            &$createdItems,
            &$updatedItems
        ) {
            $totalRows = $highestRow - $startRow + 1;
            $chunks = (int) ceil($totalRows / $chunkSize);

            for ($c = 0; $c < $chunks; $c++) {
                $chunkStart = $startRow + ($c * $chunkSize);
                $chunkEnd = min($highestRow, $chunkStart + $chunkSize - 1);

                for ($row = $chunkStart; $row <= $chunkEnd; $row++) {
                    $materialNumber = trim((string) $this->getCellValue($sheet, "{$this->columnMap['material']}{$row}"));

                    // Skip empty material numbers
                    if ($materialNumber === '' || $materialNumber === '0') {
                        $skipped++;
                        continue;
                    }

                    $sparepartData = $this->buildSparepartData($sheet, $row, $materialNumber);

                    $existing = Sparepart::where('material_number', $materialNumber)->first();

                    if ($existing) {
                        $existing->fill($sparepartData);

                        if ($existing->isDirty()) {
                            $diffList = [];
                            foreach ($existing->getDirty() as $field => $newVal) {
                                if (in_array($field, ['updated_at', 'created_at', 'status'])) {
                                    continue;
                                }
                                $oldVal = $existing->getOriginal($field);
                                if (! $this->isFieldActuallyChanged($field, $oldVal, $newVal)) {
                                    continue;
                                }
                                $diffList[] = [
                                    'field'    => $field,
                                    'label'    => $this->humanizeField($field),
                                    'oldValue' => $this->formatDisplayValue($field, $oldVal),
                                    'newValue' => $this->formatDisplayValue($field, $newVal),
                                ];
                            }

                            if (! empty($diffList)) {
                                $existing->save();
                                $updated++;

                                if (count($updatedItems) < 150) {
                                    $updatedItems[] = [
                                        'material_number' => $materialNumber,
                                        'part_name'       => $existing->part_name,
                                        'type'            => 'updated',
                                        'changes'         => $diffList,
                                    ];
                                }
                            } else {
                                $unchanged++;
                            }
                        } else {
                            $unchanged++;
                        }
                    } else {
                        $newSp = Sparepart::create($sparepartData);
                        $created++;

                        if (count($createdItems) < 150) {
                            $createdItems[] = [
                                'material_number' => $materialNumber,
                                'part_name'       => $newSp->part_name,
                                'type'            => 'created',
                                'actual_stock'    => $newSp->actual_stock,
                                'safety_stock'    => $newSp->safety_stock,
                                'unit'            => $newSp->unit ?? '-',
                                'price_per_unit'  => $newSp->price_per_unit ? number_format((float) $newSp->price_per_unit, 0, ',', '.') : '-',
                                'rank'            => $newSp->rank,
                            ];
                        }
                    }
                }

                // Bersihkan memori siklus per chunk
                if (function_exists('gc_collect_cycles')) {
                    gc_collect_cycles();
                }
            }
        });

        // Bebaskan objek spreadsheet dari memory
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        if ($created === 0 && $updated === 0 && $unchanged === 0) {
            throw new Exception('Tidak ada data sparepart valid yang ditemukan.');
        }

        return [
            'created'        => $created,
            'updated'        => $updated,
            'unchanged'      => $unchanged,
            'skipped'        => $skipped,
            'total'          => $created + $updated + $unchanged,
            'created_items'  => $createdItems,
            'updated_items'  => $updatedItems,
            'has_more_items' => ($created + $updated) > (count($createdItems) + count($updatedItems)),
        ];
    }

    /**
     * Locate and strictly validate the header row in the workbook.
     *
     * @param Spreadsheet $spreadsheet
     * @return array{0: Worksheet, 1: int, 2: int} [$sheet, $headerRow, $startRow]
     * @throws Exception
     */
    protected function findAndValidateHeaderRow(Spreadsheet $spreadsheet): array
    {
        $sheetsToInspect = [];
        $masterListSheet = $spreadsheet->getSheetByName('Master List');
        if ($masterListSheet) {
            $sheetsToInspect[] = $masterListSheet;
        }
        foreach ($spreadsheet->getAllSheets() as $sh) {
            if (! in_array($sh, $sheetsToInspect, true)) {
                $sheetsToInspect[] = $sh;
            }
        }

        foreach ($sheetsToInspect as $sheet) {
            $highestRow = $sheet->getHighestRow();
            $maxScanRow = min($highestRow, 35);
            $highestColumn = $sheet->getHighestColumn();
            $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);

            for ($row = 1; $row <= $maxScanRow; $row++) {
                $hasMaterial = false;
                $hasPart = false;
                $rowCols = [];

                for ($col = 1; $col <= min($highestColumnIndex, 35); $col++) {
                    $colLetter = Coordinate::stringFromColumnIndex($col);
                    $cellVal = strtolower(trim((string) $sheet->getCell("{$colLetter}{$row}")->getValue()));
                    if ($cellVal === '') {
                        continue;
                    }
                    $rowCols[$colLetter] = $cellVal;

                    if (str_contains($cellVal, 'material')) {
                        $hasMaterial = true;
                    }
                    if (str_contains($cellVal, 'part') || str_contains($cellVal, 'nama')) {
                        $hasPart = true;
                    }
                }

                if ($hasMaterial && $hasPart) {
                    foreach ($rowCols as $colLetter => $val) {
                        if (str_contains($val, 'material')) {
                            $this->columnMap['material'] = $colLetter;
                        } elseif (str_contains($val, 'location') || str_contains($val, 'rack') || str_contains($val, 'lokasi')) {
                            $this->columnMap['location'] = $colLetter;
                        } elseif (str_contains($val, 'part') || str_contains($val, 'nama')) {
                            $this->columnMap['part_name'] = $colLetter;
                        } elseif (str_contains($val, 'spec') || str_contains($val, 'spesifikasi')) {
                            $this->columnMap['specification'] = $colLetter;
                        } elseif (str_contains($val, 'brand') || str_contains($val, 'merk')) {
                            $this->columnMap['brand'] = $colLetter;
                        } elseif (str_contains($val, 'categor') || str_contains($val, 'kategori')) {
                            $this->columnMap['category'] = $colLetter;
                        } elseif (str_contains($val, 'safety')) {
                            $this->columnMap['safety_stock'] = $colLetter;
                        } elseif (str_contains($val, 'wh') || str_contains($val, 'actual') || str_contains($val, 'stock') || str_contains($val, 'stok')) {
                            if (! str_contains($val, 'safety')) {
                                if (str_contains($val, 'wh') || ! isset($this->columnMap['actual_stock'])) {
                                    $this->columnMap['actual_stock'] = $colLetter;
                                }
                            }
                        } elseif (str_contains($val, 'unit') || str_contains($val, 'satuan')) {
                            $this->columnMap['unit'] = $colLetter;
                        } elseif (str_contains($val, 'resource') || str_contains($val, 'sumber')) {
                            $this->columnMap['resource'] = $colLetter;
                        } elseif (str_contains($val, 'po') && (str_contains($val, 'no') || str_contains($val, 'num'))) {
                            $this->columnMap['last_po'] = $colLetter;
                        } elseif (str_contains($val, 'supplier')) {
                            $this->columnMap['last_supplier'] = $colLetter;
                        } elseif (str_contains($val, 'gr') || str_contains($val, 'date') || str_contains($val, 'tgl')) {
                            $this->columnMap['gr_date'] = $colLetter;
                        } elseif (str_contains($val, 'value') || str_contains($val, 'price') || str_contains($val, 'harga')) {
                            $this->columnMap['price'] = $colLetter;
                        } elseif (str_contains($val, 'rank')) {
                            $this->columnMap['rank'] = $colLetter;
                        }
                    }

                    return [$sheet, $row, $row + 1];
                }
            }
        }

        throw new Exception('Format kolom header tidak sesuai template Master List.');
    }

    protected function humanizeField(string $field): string
    {
        return match ($field) {
            'part_name'      => 'Nama Part',
            'specification'  => 'Spesifikasi',
            'actual_stock'   => 'Stok Riil (WH Stock)',
            'safety_stock'   => 'Safety Stock',
            'unit'           => 'Unit',
            'resource'       => 'Resource',
            'price_per_unit' => 'Harga Satuan',
            'rank'           => 'Rank',
            'last_po_number' => 'No. PO Terakhir',
            'last_supplier'  => 'Supplier Terakhir',
            'last_gr_date'   => 'Tgl. GR Terakhir',
            'brand_id'       => 'Brand',
            'category_id'    => 'Kategori',
            'bin_id'         => 'Lokasi (Bin)',
            default          => ucfirst(str_replace('_', ' ', $field)),
        };
    }

    protected function formatDisplayValue(string $field, mixed $val): string
    {
        if ($val === null || $val === '') {
            return '(kosong)';
        }

        if ($field === 'price_per_unit' && is_numeric($val)) {
            return 'Rp ' . number_format((float) $val, 0, ',', '.');
        }

        if ($field === 'bin_id' && is_numeric($val)) {
            $bin = Bin::find((int) $val);
            return $bin ? $bin->code : "(bin #{$val})";
        }

        if ($field === 'brand_id' && is_numeric($val)) {
            $brand = Brand::find((int) $val);
            return $brand ? $brand->name : "(brand #{$val})";
        }

        if ($field === 'category_id' && is_numeric($val)) {
            $category = Category::find((int) $val);
            return $category ? $category->name : "(kategori #{$val})";
        }

        return (string) $val;
    }

    protected function isFieldActuallyChanged(string $field, mixed $oldVal, mixed $newVal): bool
    {
        // 1. Periksa format visual - jika setelah diformat hasilnya identik, maka tidak ada perubahan nyata
        $oldFormatted = $this->formatDisplayValue($field, $oldVal);
        $newFormatted = $this->formatDisplayValue($field, $newVal);
        if ($oldFormatted === $newFormatted) {
            return false;
        }

        // 2. Kolom harga (price_per_unit): perbandingan toleransi float (< 0.01 rupiah)
        if ($field === 'price_per_unit') {
            $oldNum = ($oldVal !== null && $oldVal !== '') ? (float) $oldVal : null;
            $newNum = ($newVal !== null && $newVal !== '') ? (float) $newVal : null;
            if ($oldNum === null && $newNum === null) {
                return false;
            }
            if ($oldNum !== null && $newNum !== null) {
                return abs($oldNum - $newNum) >= 0.01;
            }
            return true;
        }

        // 3. Kolom integer (stok & ID relasi)
        if (in_array($field, ['safety_stock', 'actual_stock', 'brand_id', 'category_id', 'bin_id'], true)) {
            $oldInt = ($oldVal !== null && $oldVal !== '') ? (int) $oldVal : 0;
            $newInt = ($newVal !== null && $newVal !== '') ? (int) $newVal : 0;
            return $oldInt !== $newInt;
        }

        // 4. Kolom tanggal (last_gr_date)
        if ($field === 'last_gr_date') {
            $oldDate = $oldVal ? Carbon::parse($oldVal)->format('Y-m-d') : null;
            $newDate = $newVal ? Carbon::parse($newVal)->format('Y-m-d') : null;
            return $oldDate !== $newDate;
        }

        // 5. Kolom string nullable (kosong dan null dianggap sama)
        $cleanOld = trim((string) $oldVal);
        $cleanNew = trim((string) $newVal);

        if ($cleanOld === '' && $cleanNew === '') {
            return false;
        }

        return $cleanOld !== $cleanNew;
    }

    protected function getCellValue(Worksheet $sheet, string $coord): mixed
    {
        $cell = $sheet->getCell($coord);
        $val  = $cell->getValue();

        if (is_string($val) && str_starts_with($val, '=')) {
            try {
                return $cell->getCalculatedValue();
            } catch (\Throwable) {
                return null;
            }
        }

        return $val;
    }

    protected function parseDate(mixed $cellOrValue): ?string
    {
        if ($cellOrValue === null || $cellOrValue === '') {
            return null;
        }

        try {
            if (is_object($cellOrValue) && method_exists($cellOrValue, 'getValue')) {
                $val = $cellOrValue->getValue();
                if (is_numeric($val) && ExcelDate::isDateTime($cellOrValue)) {
                    return ExcelDate::excelToDateTimeObject((float) $val)->format('Y-m-d');
                }
                if ($val instanceof \DateTimeInterface) {
                    return Carbon::instance($val)->format('Y-m-d');
                }
                $valStr = trim((string) $val);
            } else {
                $valStr = trim((string) $cellOrValue);
            }

            if ($valStr === '') {
                return null;
            }

            if (preg_match('/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/', $valStr)) {
                $delimiter = str_contains($valStr, '/') ? '/' : '-';
                $parts = explode($delimiter, $valStr);
                return Carbon::createFromDate((int) $parts[2], (int) $parts[1], (int) $parts[0])->format('Y-m-d');
            }

            $parsed = Carbon::parse($valStr);
            if ($parsed && $parsed->year >= 1990 && $parsed->year <= 2100) {
                return $parsed->format('Y-m-d');
            }
        } catch (\Throwable) {
            // silent fall
        }

        return null;
    }

    protected function resolveBrand(string $name): int
    {
        $normalized = trim($name);
        if (isset($this->brandCache[$normalized])) {
            return $this->brandCache[$normalized];
        }

        $brand = Brand::firstOrCreate(['name' => $normalized]);
        $this->brandCache[$normalized] = $brand->id;

        return $brand->id;
    }

    protected function resolveCategory(string $name): int
    {
        $normalized = trim($name);
        if (isset($this->categoryCache[$normalized])) {
            return $this->categoryCache[$normalized];
        }

        $category = Category::firstOrCreate(['name' => $normalized]);
        $this->categoryCache[$normalized] = $category->id;

        return $category->id;
    }

    protected function resolveRack(string $rackCode): int
    {
        $code = strtoupper(trim($rackCode));
        if ($code === '') {
            $code = 'GEN';
        }

        if (isset($this->rackCache[$code])) {
            return $this->rackCache[$code];
        }

        $rack = Rack::firstOrCreate(['code' => $code]);
        $this->rackCache[$code] = $rack->id;

        return $rack->id;
    }

    protected function resolveBin(string $location): int
    {
        $raw = trim($location);
        if ($raw === '') {
            $raw = 'LOC-STOCKROOM';
        }

        if (isset($this->binCache[$raw])) {
            return $this->binCache[$raw];
        }

        // 1. Ekstraksi Bin & Rack dari format Excel (contoh: "A/A21", "A / A.2.1", atau "A1.1")
        if (str_contains($raw, '/')) {
            $parts = explode('/', $raw, 2);
            $rackCandidate = strtoupper(trim($parts[0]));
            $binCandidate  = trim($parts[1]);

            // Jika binCandidate tidak diawali huruf rack (misal "A/21"), gabungkan menjadi "A21"
            if ($rackCandidate !== '' && ! str_starts_with(strtoupper($binCandidate), substr($rackCandidate, 0, 1))) {
                $binCandidate = substr($rackCandidate, 0, 1) . $binCandidate;
            }

            $binCode  = $binCandidate;
            $rackCode = substr($rackCandidate, 0, 1);
        } else {
            $binCode = $raw;
            $rackCode = '';
        }

        // 2. Rack adalah 1 huruf yang ada di awal kode Bin (contoh: "A1.1" -> Rack "A")
        if ($rackCode === '' && preg_match('/^([A-Za-z])/u', $binCode, $m)) {
            $rackCode = strtoupper($m[1]);
        }

        if ($rackCode === '') {
            $rackCode = 'GEN';
        }

        // 3. Normalisasi self-healing jika ada double-letter export lama (misal "AA1.1" -> cek apakah "A1.1" ada)
        if (preg_match('/^([A-Za-z])\1(.+)$/', $binCode, $doubleMatch)) {
            $singleVariant = $doubleMatch[1] . $doubleMatch[2];
            if (Bin::where('code', $singleVariant)->exists()) {
                $binCode = $singleVariant;
            }
        }

        // 4. Cari Bin yang sudah ada
        $existingBin = Bin::where('code', $binCode)->first();
        if ($existingBin) {
            $this->binCache[$raw] = $existingBin->id;
            return $existingBin->id;
        }

        $rackId = $this->resolveRack($rackCode);

        try {
            $bin = Bin::firstOrCreate(
                ['code' => $binCode],
                ['rack_id' => $rackId]
            );
        } catch (\Throwable) {
            $bin = Bin::where('code', $binCode)->first() ?? Bin::firstOrCreate(
                ['code' => 'LOC-STOCKROOM'],
                ['rack_id' => $rackId]
            );
        }

        $this->binCache[$raw] = $bin->id;

        return $bin->id;
    }

    /**
     * Build the sparepart data array from a sheet row.
     * This is shared between dryRun() and import() to avoid duplication.
     */
    protected function buildSparepartData(Worksheet $sheet, int $row, string $materialNumber): array
    {
        $m = $this->columnMap;

        $partName = trim((string) $this->getCellValue($sheet, "{$m['part_name']}{$row}"));
        if ($partName === '') {
            $partName = $materialNumber;
        }

        $locationRaw   = trim((string) $this->getCellValue($sheet, "{$m['location']}{$row}"));
        $specification = trim((string) $this->getCellValue($sheet, "{$m['specification']}{$row}"));
        $brandName     = trim((string) $this->getCellValue($sheet, "{$m['brand']}{$row}"));
        $categoryName  = trim((string) $this->getCellValue($sheet, "{$m['category']}{$row}"));

        $safetyStock = $this->toIntOrZero($this->getCellValue($sheet, "{$m['safety_stock']}{$row}"));
        // WH Stock dan Actual Stock diperlakukan sama — keduanya = actual_stock di DB
        $actualStock = $this->toIntOrZero($this->getCellValue($sheet, "{$m['actual_stock']}{$row}"));

        $unit     = trim((string) $this->getCellValue($sheet, "{$m['unit']}{$row}"));
        $resource = trim((string) $this->getCellValue($sheet, "{$m['resource']}{$row}"));

        $lastPoNumber = trim((string) $this->getCellValue($sheet, "{$m['last_po']}{$row}"));
        $lastSupplier = trim((string) $this->getCellValue($sheet, "{$m['last_supplier']}{$row}"));

        $cellP      = $sheet->getCell("{$m['gr_date']}{$row}");
        $lastGrDate = $this->parseDate($cellP);

        $pricePerUnit = $this->toFloatOrZero($this->getCellValue($sheet, "{$m['price']}{$row}"));

        $rankRaw = strtoupper(trim((string) $this->getCellValue($sheet, "{$m['rank']}{$row}")));
        $rank    = in_array($rankRaw, ['A', 'B', 'C'], true) ? $rankRaw : 'C';

        if ($brandName === '') {
            $brandName = 'General / Lainnya';
        }
        if ($categoryName === '') {
            $categoryName = 'Umum';
        }

        $brandId    = $this->resolveBrand($brandName);
        $categoryId = $this->resolveCategory($categoryName);

        if ($locationRaw === '') {
            $locationRaw = 'LOC-STOCKROOM';
        }
        $binId = $this->resolveBin($locationRaw);

        return [
            'material_number' => $materialNumber,
            'part_name'       => $partName,
            'specification'   => $specification !== '' ? $specification : '-',
            'brand_id'        => $brandId,
            'category_id'     => $categoryId,
            'bin_id'          => $binId,
            'safety_stock'    => $safetyStock,
            'actual_stock'    => $actualStock,
            'unit'            => $unit !== '' ? $unit : null,
            'resource'        => $resource !== '' ? $resource : null,
            'last_po_number'  => $lastPoNumber !== '' ? $lastPoNumber : null,
            'last_supplier'   => $lastSupplier !== '' ? $lastSupplier : null,
            'last_gr_date'    => $lastGrDate,
            'price_per_unit'  => $pricePerUnit > 0 ? number_format($pricePerUnit, 2, '.', '') : null,
            'rank'            => $rank,
        ];
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
        if (is_bool($v)) return 1.0;
        if (is_numeric($v)) return (float) $v;
        if (is_string($v)) {
            $str = trim($v);
            $str = preg_replace('/[^\d.,\-]/', '', $str);
            if ($str === '') return 0.0;

            // Kasus format angka dengan ribuan & desimal
            if (str_contains($str, ',') && str_contains($str, '.')) {
                if (strrpos($str, ',') > strrpos($str, '.')) {
                    // ID format: 1.000,50
                    $str = str_replace('.', '', $str);
                    $str = str_replace(',', '.', $str);
                } else {
                    // EN format: 1,000.50
                    $str = str_replace(',', '', $str);
                }
            } elseif (str_contains($str, ',')) {
                // Hanya koma: jika 3 digit di akhir (misal 42,000), anggap ribuan
                if (preg_match('/,\d{3}$/', $str)) {
                    $str = str_replace(',', '', $str);
                } else {
                    $str = str_replace(',', '.', $str);
                }
            } elseif (str_contains($str, '.')) {
                // Hanya titik: jika 3 digit di akhir (misal 42.000), anggap ribuan ID
                if (preg_match('/\.\d{3}$/', $str)) {
                    $str = str_replace('.', '', $str);
                }
            }

            if (is_numeric($str)) return (float) $str;
        }
        return 0.0;
    }
}
