<?php

namespace App\Exports;

use App\Models\ActivityLog;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Export IN / OUT Control Report to .xlsx
 * 
 * Layout 100% matches the Valeo IN/OUT CONTROL template:
 *   - Font: Arial across the entire spreadsheet
 *   - Columns B through J (No, Date, Bin Number, Part Name, Specification, Brand, Qty, PIC, Remarks)
 *   - Rows 3-6: Form header with Valeo Logo image, Document No, Revision, Date, Page
 *   - Row 8: Notice banner
 *   - Row 10: Yellow table headers
 *   - Row 11+: Centered data rows with light yellow fill on column B (No)
 *   - AutoFilter & Freeze pane enabled
 *   - Direct StreamedResponse (no storage write)
 */
class ActivityLogControlExport
{
    public static function download(
        string $type = 'OUT',
        ?string $docNo = null,
        ?string $revision = null,
        ?string $from = null,
        ?string $to = null,
        ?string $search = null
    ): StreamedResponse {
        $type = strtoupper($type) === 'IN' ? 'IN' : 'OUT';
        $spreadsheet = self::buildSpreadsheet($type, $docNo, $revision, $from, $to, $search);
        $writer = new Xlsx($spreadsheet);

        $typeLabel = $type === 'IN' ? 'IN_CONTROL' : 'OUT_CONTROL';
        $filename = "Warehouse Management System_A23_{$typeLabel}_".now()->format('d-m-Y').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public static function buildSpreadsheet(
        string $type = 'OUT',
        ?string $docNo = null,
        ?string $revision = null,
        ?string $from = null,
        ?string $to = null,
        ?string $search = null
    ): Spreadsheet {
        $type = strtoupper($type) === 'IN' ? 'IN' : 'OUT';

        // Default doc numbers
        $defaultDocNo = $type === 'IN' ? 'VI-MT-QP01-001-F04' : 'VI-MT-QP01-001-F05';
        $docNo = $docNo !== null && trim($docNo) !== '' ? trim($docNo) : $defaultDocNo;
        $revision = $revision !== null && trim($revision) !== '' ? trim($revision) : '0';

        // Query activity logs
        $query = ActivityLog::with(['sparepart.brand', 'sparepart.bin.rack', 'user'])
            ->where('type', $type)
            ->orderBy('performed_at', 'asc');

        if ($from) {
            $query->whereDate('performed_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('performed_at', '<=', $to);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('sparepart', function ($sq) use ($search) {
                    $sq->where('material_number', 'like', "%{$search}%")
                        ->orWhere('part_name', 'like', "%{$search}%")
                        ->orWhere('specification', 'like', "%{$search}%");
                })->orWhere('control_id', 'like', "%{$search}%")
                  ->orWhere('remarks', 'like', "%{$search}%");
            });
        }

        $logs = $query->get();

        $spreadsheet = new Spreadsheet();
        $spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

        $sheet = $spreadsheet->getActiveSheet();
        $sheetTitle = $type === 'IN' ? 'In Control' : 'Out Control';
        $sheet->setTitle($sheetTitle);

        self::setColumnWidths($sheet);
        self::setRowHeights($sheet);
        self::buildFormHeader($sheet, $type, $docNo, $revision);
        self::buildNoticeBanner($sheet, $type);
        self::buildTableHeader($sheet);
        self::writeDataRows($sheet, $logs);

        $maxRow = $logs->count() > 0 ? (11 + $logs->count() - 1) : 11;
        $sheet->setAutoFilter("B10:J{$maxRow}");

        $sheet->freezePane('B11');
        $sheet->setShowGridlines(true);

        return $spreadsheet;
    }

    /*
    |--------------------------------------------------------------------------
    | COLUMN WIDTHS & ROW HEIGHTS
    |--------------------------------------------------------------------------
    */

    private static function setColumnWidths($sheet): void
    {
        $widths = [
            'A' => 2.0,
            'B' => 7.0,    // No
            'C' => 14.0,   // Date
            'D' => 14.0,   // Bin Number
            'E' => 24.0,   // Part Name
            'F' => 26.0,   // Specification
            'G' => 18.0,   // Brand
            'H' => 10.0,   // Qty
            'I' => 18.0,   // PIC
            'J' => 24.0,   // Remarks
        ];
        foreach ($widths as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }
    }

    private static function setRowHeights($sheet): void
    {
        $sheet->getRowDimension(1)->setRowHeight(9);
        $sheet->getRowDimension(2)->setRowHeight(12);
        for ($r = 3; $r <= 6; $r++) {
            $sheet->getRowDimension($r)->setRowHeight(16.5);
        }
        $sheet->getRowDimension(7)->setRowHeight(10);
        $sheet->getRowDimension(8)->setRowHeight(22);
        $sheet->getRowDimension(9)->setRowHeight(10);
        $sheet->getRowDimension(10)->setRowHeight(24);
    }

    /*
    |--------------------------------------------------------------------------
    | SECTION: Form Header (Rows 3-6)
    |--------------------------------------------------------------------------
    */

    private static function buildFormHeader($sheet, string $type, string $docNo, string $revision): void
    {
        $center = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();

        // ── Logo Valeo: B3:D6 merged ──
        $sheet->mergeCells('B3:D6');
        $sheet->getStyle('B3:D6')->applyFromArray($borderThin);

        $logoPath = public_path('logo.png');
        if (file_exists($logoPath)) {
            $drawing = new Drawing();
            $drawing->setName('Valeo Logo');
            $drawing->setDescription('Valeo Logo');
            $drawing->setPath($logoPath);
            $drawing->setCoordinates('B3');
            $drawing->setHeight(46);
            $drawing->setOffsetX(75);
            $drawing->setOffsetY(21);
            $drawing->setWorksheet($sheet);
        } else {
            $sheet->setCellValue('B3', 'Valeo');
            $sheet->getStyle('B3')->applyFromArray(array_merge([
                'font' => ['bold' => true, 'size' => 18, 'italic' => true, 'name' => 'Arial', 'color' => ['argb' => 'FF006400']],
            ], $center));
        }

        // ── Form label: E3:G3 merged ──
        $sheet->mergeCells('E3:G3');
        $sheet->setCellValue('E3', 'Form');
        $sheet->getStyle('E3')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
        ], $center));

        // ── Title: E4:G6 merged ──
        $titleText = $type === 'IN' ? 'IN CONTROL' : 'OUT CONTROL';
        $sheet->mergeCells('E4:G6');
        $sheet->setCellValue('E4', $titleText);
        $sheet->getStyle('E4')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 14, 'name' => 'Arial'],
        ], $center));

        // ── Document info (H3:J6) ──
        // Row 3: Document No.
        $sheet->setCellValue('H3', 'Document No.');
        $sheet->getStyle('H3')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('I3:J3');
        $sheet->setCellValue('I3', ': '.$docNo);
        $sheet->getStyle('I3')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));

        // Row 4: Revision
        $sheet->setCellValue('H4', 'Revision');
        $sheet->getStyle('H4')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('I4:J4');
        $sheet->setCellValue('I4', ': '.$revision);
        $sheet->getStyle('I4')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));

        // Row 5: Date
        $todayDate = now()->format('d-m-Y');
        $sheet->setCellValue('H5', 'Date');
        $sheet->getStyle('H5')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('I5:J5');
        $sheet->setCellValue('I5', ': '.$todayDate);
        $sheet->getStyle('I5')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));

        // Row 6: Page
        $sheet->setCellValue('H6', 'Page');
        $sheet->getStyle('H6')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('I6:J6');
        $sheet->setCellValue('I6', ': 1 of 1');
        $sheet->getStyle('I6')->applyFromArray(array_merge([
            'font' => ['size' => 11, 'name' => 'Arial'],
        ], $center));

        $sheet->getStyle('E3:G6')->applyFromArray($borderThin);
        $sheet->getStyle('H3:J6')->applyFromArray($borderThin);
    }

    /*
    |--------------------------------------------------------------------------
    | SECTION: Notice Banner (Row 8)
    |--------------------------------------------------------------------------
    */

    private static function buildNoticeBanner($sheet, string $type): void
    {
        $center = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();

        $sheet->mergeCells('B8:J8');
        if ($type === 'IN') {
            $sheet->setCellValue('B8', "⚡ Only in sparepart need to input here, don't forget to input sparepart here while receiving into warehouse ⚡");
        } else {
            $sheet->setCellValue('B8', "⚡ Only out sparepart need to input here, don't forget to input sparepart here while taking out from warehouse ⚡");
        }

        $sheet->getStyle('B8')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 11, 'name' => 'Arial'],
        ], $center));
        $sheet->getStyle('B8:J8')->applyFromArray($borderThin);
    }

    /*
    |--------------------------------------------------------------------------
    | SECTION: Table Header (Row 10)
    |--------------------------------------------------------------------------
    */

    private static function buildTableHeader($sheet): void
    {
        $center = [
            'alignment' => [
                'wrapText'   => true,
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();

        $headers = [
            'B10' => 'No',
            'C10' => 'Date',
            'D10' => 'Bin Number',
            'E10' => 'Part Name',
            'F10' => 'Specification',
            'G10' => 'Brand',
            'H10' => 'Qty',
            'I10' => 'PIC',
            'J10' => 'Remarks',
        ];

        foreach ($headers as $cell => $label) {
            $sheet->setCellValue($cell, $label);
            $sheet->getStyle($cell)->applyFromArray(array_merge([
                'font' => ['bold' => true, 'size' => 11, 'name' => 'Arial'],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFF00']],
            ], $borderThin, $center));
        }
    }

    /*
    |--------------------------------------------------------------------------
    | DATA ROWS (Row 11+)
    |--------------------------------------------------------------------------
    */

    private static function writeDataRows($sheet, $logs): void
    {
        $centerWrap = [
            'alignment' => [
                'wrapText'   => true,
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();
        $noBgStyle = [
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFE599']],
        ];

        $startRow = 11;

        if ($logs->count() === 0) {
            $sheet->mergeCells('B'.$startRow.':J'.$startRow);
            $sheet->setCellValue('B'.$startRow, 'No transaction data available.');
            $sheet->getStyle('B'.$startRow)->applyFromArray(array_merge($borderThin, $centerWrap));

            return;
        }

        foreach ($logs as $idx => $log) {
            $r = $startRow + $idx;
            $no = $idx + 1;
            $sparepart = $log->sparepart;
            $user = $log->user;

            $dateFormatted = $log->performed_at
                ? \Illuminate\Support\Carbon::parse($log->performed_at)->format('d-m-Y')
                : '';

            $binNumber = '';
            if ($sparepart && $sparepart->bin) {
                $rackCode = $sparepart->bin->rack?->code ?? '';
                $binCode  = $sparepart->bin->code ?? '';
                $binNumber = "{$rackCode}{$binCode}";
            }

            // B: No
            $sheet->setCellValue('B'.$r, $no);
            // C: Date
            $sheet->setCellValue('C'.$r, $dateFormatted);
            // D: Bin Number
            $sheet->setCellValue('D'.$r, $binNumber);
            // E: Part Name
            $sheet->setCellValue('E'.$r, $sparepart?->part_name ?? '');
            // F: Specification
            $sheet->setCellValue('F'.$r, $sparepart?->specification ?? '');
            // G: Brand
            $sheet->setCellValue('G'.$r, $sparepart?->brand?->name ?? '');
            // H: Qty
            $sheet->setCellValue('H'.$r, abs((int) $log->quantity));
            // I: PIC
            $sheet->setCellValue('I'.$r, $user?->name ?? '');
            // J: Remarks
            $sheet->setCellValue('J'.$r, $log->remarks ?? '');

            // ── Styling: Centered horizontally & vertically, wrapText=true ──
            $sheet->getStyle('B'.$r.':J'.$r)->applyFromArray(array_merge($borderThin, $centerWrap));
            
            // Light yellow / tan fill on column B (No) matching the template
            $sheet->getStyle('B'.$r)->applyFromArray($noBgStyle);
        }
    }

    private static function borderThin(): array
    {
        return [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => Color::COLOR_BLACK],
                ],
            ],
        ];
    }
}
