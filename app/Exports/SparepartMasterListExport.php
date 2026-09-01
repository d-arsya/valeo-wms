<?php

namespace App\Exports;

use App\Models\Sparepart;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Export Sparepart Master List to .xlsx
 * 
 * Layout 100% matches the original Valeo template:
 *   - Columns B through U (column A is narrow spacer)
 *   - Row 1 is narrow spacer
 *   - Rows 3-6: Form header with Valeo logo, doc info
 *   - Row 7: empty separator
 *   - Rows 8-11: PIC/Revise/Update Date, Rank Description, Category Description
 *   - Row 12: "Part Description" + "Stock Data Last Updated"
 *   - Row 13: Column headers
 *   - Row 14+: Data rows
 */
class SparepartMasterListExport
{
    public static function download(): StreamedResponse
    {
        $spreadsheet = self::buildSpreadsheet();
        $writer = new Xlsx($spreadsheet);
        $filename = 'Valeo_WMS_Sparepart_MasterList_'.now()->format('Ymd_His').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public static function buildSpreadsheet(): Spreadsheet
    {
        $spareparts = Sparepart::with(['brand', 'category', 'bin.rack'])
            ->orderBy('material_number')
            ->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Master List');

        // ── Build all sections exactly as the original ──
        self::setColumnWidths($sheet);
        self::setRowHeights($sheet);
        self::buildFormHeader($sheet);
        self::buildInfoSection($sheet);
        self::buildTableHeader($sheet);
        self::writeDataRows($sheet, $spareparts);

        $sheet->freezePane('B14');
        $sheet->setShowGridlines(true);

        return $spreadsheet;
    }

    /*
    |--------------------------------------------------------------------------
    | COLUMN WIDTHS & ROW HEIGHTS — Exact match to original
    |--------------------------------------------------------------------------
    */

    private static function setColumnWidths($sheet): void
    {
        $widths = [
            'A' => 1.5,
            'B' => 6.63,
            'C' => 16.13,
            'D' => 10,     // Location Rack Number
            'E' => 24.38,
            'F' => 24.88,
            'G' => 17.38,
            'H' => 17.63,
            'I' => 8.88,
            'J' => 8.38,
            'K' => 9.88,
            'L' => 7.88,
            'M' => 17.88,
            'N' => 17.38,
            'O' => 20.38,
            'P' => 16.63,
            'Q' => 14,
            'R' => 22.38,
            'S' => 11.38,
            'T' => 10,
            'U' => 9.13,
        ];
        foreach ($widths as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }
    }

    private static function setRowHeights($sheet): void
    {
        $sheet->getRowDimension(1)->setRowHeight(9);
        for ($r = 2; $r <= 7; $r++) {
            $sheet->getRowDimension($r)->setRowHeight(16.5);
        }
        for ($r = 8; $r <= 11; $r++) {
            $sheet->getRowDimension($r)->setRowHeight(31.5);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | SECTION: Form Header (Rows 2-6)
    |--------------------------------------------------------------------------
    */

    private static function buildFormHeader($sheet): void
    {
        $center = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();

        // ── Valeo logo area: B3:D6 merged ──
        $sheet->mergeCells('B3:D6');
        $sheet->setCellValue('B3', 'Valeo');
        $sheet->getStyle('B3')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 18, 'italic' => true, 'name' => 'Arial', 'color' => ['argb' => 'FF006400']],
        ], $center));
        $sheet->getStyle('B3:D6')->applyFromArray($borderThin);

        // ── "Form" label: E3:Q3 merged (row 3) ──
        $sheet->mergeCells('E3:Q3');
        $sheet->setCellValue('E3', 'Form');
        $sheet->getStyle('E3')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
        ], $center));

        // ── Title: E4:Q6 merged ──
        $sheet->mergeCells('E4:Q6');
        $sheet->setCellValue('E4', 'SPAREPART CONTROL MANAGEMENT (MASTER)');
        $sheet->getStyle('E4')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
        ], $center));

        // ── Document info (right side) ──
        // Row 3: Document No.
        $sheet->mergeCells('R3:S3');
        $sheet->setCellValue('R3', 'Document No.');
        $sheet->getStyle('R3')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('T3:U3');
        $sheet->setCellValue('T3', ': VI-MT-QP01-001-F02');
        $sheet->getStyle('T3')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        // Row 4: Revision
        $sheet->mergeCells('R4:S4');
        $sheet->setCellValue('R4', 'Revision');
        $sheet->getStyle('R4')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('T4:U4');
        $sheet->setCellValue('T4', ': 0');
        $sheet->getStyle('T4')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        // Row 5: Date
        $sheet->mergeCells('R5:S5');
        $sheet->setCellValue('R5', 'Date');
        $sheet->getStyle('R5')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('T5:U5');
        $sheet->setCellValue('T5', ': 02-05-2024');
        $sheet->getStyle('T5')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        // Row 6: Page
        $sheet->mergeCells('R6:S6');
        $sheet->setCellValue('R6', 'Page');
        $sheet->getStyle('R6')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));
        $sheet->mergeCells('T6:U6');
        $sheet->setCellValue('T6', ': 1 of 1');
        $sheet->getStyle('T6')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        // Borders around the form header area
        $sheet->getStyle('E3:Q6')->applyFromArray($borderThin);
        $sheet->getStyle('R3:U6')->applyFromArray($borderThin);
    }

    /*
    |--------------------------------------------------------------------------
    | SECTION: Info rows 8-11 (PIC, Revise, Update Date, Rank & Category)
    |--------------------------------------------------------------------------
    */

    private static function buildInfoSection($sheet): void
    {
        $center = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $wrap = [
            'alignment' => [
                'wrapText' => true,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();

        // ── Row 8: PIC + Rank Description header + Category Description header ──
        $sheet->mergeCells('B8:D8');
        $sheet->setCellValue('B8', 'PIC');
        $sheet->getStyle('B8')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        $sheet->setCellValue('E8', 'Danang');
        $sheet->getStyle('E8')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        $sheet->mergeCells('F8:M8');
        $sheet->setCellValue('F8', 'Rank Description');
        $sheet->getStyle('F8')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFFFF']],
        ], $center));

        $sheet->mergeCells('N8:U8');
        $sheet->setCellValue('N8', 'Category Description');
        $sheet->getStyle('N8')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFFFF']],
        ], $center));

        $sheet->getStyle('B8:U8')->applyFromArray($borderThin);

        // ── Row 9: Revise V1.1 + Rank A + Sparepart ──
        $sheet->mergeCells('B9:D9');
        $sheet->setCellValue('B9', 'Revise');
        $sheet->getStyle('B9')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        $sheet->setCellValue('E9', 'V1.1');
        $sheet->getStyle('E9')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        // Rank A
        $sheet->setCellValue('F9', 'A');
        $sheet->getStyle('F9')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFCC4125']],
        ], $center));

        $sheet->mergeCells('G9:M9');
        $sheet->setCellValue('G9', 'Impact to quality , safety and stop line 60 minutes up , and also consider order delivery time , special parts.');
        $sheet->getStyle('G9')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFFFF']],
        ], $wrap));

        // Sparepart category
        $sheet->setCellValue('N9', 'Sparepart');
        $sheet->getStyle('N9')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFE599']],
        ], $center));

        $sheet->mergeCells('O9:U9');
        $sheet->setCellValue('O9', 'Parts that categorized as Rank A & B with clear brand and specifications or Price over Rp.5.000.000 and related to the production line.');
        $sheet->getStyle('O9')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFFFF']],
        ], $wrap));

        $sheet->getStyle('B9:U9')->applyFromArray($borderThin);

        // ── Row 10: Update Date + Rank B + Consumable ──
        $sheet->mergeCells('B10:D10');
        $sheet->setCellValue('B10', 'Update Date');
        $sheet->getStyle('B10')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        $sheet->setCellValue('E10', '25 June 2025');
        $sheet->getStyle('E10')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $center));

        // Rank B
        $sheet->setCellValue('F10', 'B');
        $sheet->getStyle('F10')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFF00']],
        ], $center));

        $sheet->mergeCells('G10:M10');
        $sheet->setCellValue('G10', 'No impact to quality and safety, impact stop line under 60 minutes');
        $sheet->getStyle('G10')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFFFF']],
        ], $wrap));

        // Consumable category
        $sheet->setCellValue('N10', 'Consumable');
        $sheet->getStyle('N10')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFBFE1F6']],
        ], $center));

        $sheet->mergeCells('O10:U10');
        $sheet->setCellValue('O10', 'Parts that categorized as Rank C, Special part customized non brand (jig, bracket, fabrication part, etc) or Price under Rp.5.000.000 and related to the production line or goods that not related to the production line.');
        $sheet->getStyle('O10')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
        ], $wrap));

        $sheet->getStyle('B10:U10')->applyFromArray($borderThin);

        // ── Row 11: Rank C + CRIB SAP note ──
        $sheet->mergeCells('B11:D11');
        // B11-E11 empty (no PIC label here)

        // Rank C
        $sheet->setCellValue('F11', 'C');
        $sheet->getStyle('F11')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF00FF00']],
        ], $center));

        $sheet->mergeCells('G11:M11');
        $sheet->setCellValue('G11', 'No impact to quality and safety, impact stop line under 10 minutes, but must consider  impact to cycle time and also even this rank C part must available ( worry impact to other part if no spare )');
        $sheet->getStyle('G11')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFFFF']],
        ], $wrap));

        $sheet->mergeCells('N11:U11');
        $sheet->setCellValue('N11', 'Sparepart order by CRIB SAP (Auto MRP or manual PR) and Consumable order by EPROC ');
        $sheet->getStyle('N11')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFFFF']],
        ], $wrap));

        $sheet->getStyle('B11:U11')->applyFromArray($borderThin);
    }

    /*
    |--------------------------------------------------------------------------
    | SECTION: Table Header (Rows 12-13)
    |--------------------------------------------------------------------------
    */

    private static function buildTableHeader($sheet): void
    {
        $center = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $wrap = [
            'alignment' => [
                'wrapText'   => true,
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();
        $updatedAt = now()->format('j F Y');

        // ── Row 12: "Part Description" (blue) + "Stock Data Last Updated" (orange) ──
        $sheet->mergeCells('B12:H12');
        $sheet->setCellValue('B12', 'Part Description');
        $sheet->getStyle('B12')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF6D9EEB']],
        ], $center));

        $sheet->mergeCells('I12:U12');
        $sheet->setCellValue('I12', 'Stock Data Last Updated : '.$updatedAt);
        $sheet->getStyle('I12')->applyFromArray(array_merge([
            'font' => ['size' => 12, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFF9900']],
        ], $center));

        $sheet->getStyle('B12:U12')->applyFromArray($borderThin);

        // ── Row 13: Column headers ──
        // Blue headers (Part Description columns): B13-H13
        $blueHeaders = [
            'B13' => 'No',
            'C13' => 'Material Number',
            'D13' => 'Location Rack Number',
            'E13' => 'Part Name',
            'F13' => 'Specification',
            'G13' => 'Brand',
            'H13' => 'Category',
        ];
        foreach ($blueHeaders as $cell => $label) {
            $sheet->setCellValue($cell, $label);
            $sheet->getStyle($cell)->applyFromArray(array_merge([
                'font' => ['bold' => true, 'size' => 12, 'name' => 'Calibri'],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF6D9EEB']],
            ], $borderThin, $wrap));
        }

        // Orange headers (Stock Data columns): I13-U13
        $orangeHeaders = [
            'I13' => 'Safety Stock',
            'J13' => 'WH Stock',
            'K13' => 'Actual Stock',
            'L13' => 'Unit',
            'M13' => 'Resource',
            'N13' => 'Last PO Number',
            'O13' => 'Last PO Supplier',
            'P13' => 'GR Date',
            'Q13' => 'Value per pcs',
            'R13' => 'Total Stock Value',
            'S13' => 'Rank',
        ];
        foreach ($orangeHeaders as $cell => $label) {
            $sheet->setCellValue($cell, $label);
            $sheet->getStyle($cell)->applyFromArray(array_merge([
                'font' => ['bold' => true, 'size' => 12, 'name' => 'Calibri'],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFF9900']],
            ], $borderThin, $wrap));
        }

        // Status header: T13:U13 merged (orange)
        $sheet->mergeCells('T13:U13');
        $sheet->setCellValue('T13', 'Status');
        $sheet->getStyle('T13')->applyFromArray(array_merge([
            'font' => ['bold' => true, 'size' => 12, 'name' => 'Calibri'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFF9900']],
        ], $borderThin, $wrap));
    }

    /*
    |--------------------------------------------------------------------------
    | DATA ROWS (Row 14+)
    |--------------------------------------------------------------------------
    */

    private static function writeDataRows($sheet, $spareparts): void
    {
        $center = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $borderThin = self::borderThin();
        $currencyFormat = '#,##0';

        $startRow = 14;

        if ($spareparts->count() === 0) {
            $sheet->mergeCells('B'.$startRow.':U'.$startRow);
            $sheet->setCellValue('B'.$startRow, 'No sparepart data available.');
            $sheet->getStyle('B'.$startRow)->applyFromArray(array_merge($borderThin, $center));

            return;
        }

        foreach ($spareparts as $idx => $sp) {
            $r = $startRow + $idx;
            $no = $idx + 1;
            $rackBin = self::rackBinLabel($sp);
            $valuePer = $sp->price_per_unit ?? 0;
            $grDate = self::formatGrDate($sp->last_gr_date);

            // B: No
            $sheet->setCellValue('B'.$r, $no);
            // C: Material Number
            $sheet->setCellValueExplicit(
                'C'.$r,
                (string) $sp->material_number,
                \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING
            );
            // D: Location Rack Number
            $sheet->setCellValue('D'.$r, $rackBin);
            // E: Part Name
            $sheet->setCellValue('E'.$r, $sp->part_name ?? '');
            // F: Specification
            $sheet->setCellValue('F'.$r, $sp->specification ?? '');
            // G: Brand
            $sheet->setCellValue('G'.$r, $sp->brand?->name ?? '');
            // H: Category
            $sheet->setCellValue('H'.$r, $sp->category?->name ?? '');
            // I: Safety Stock
            $sheet->setCellValue('I'.$r, $sp->safety_stock ?? '');
            // J: WH Stock (= actual_stock from DB)
            $sheet->setCellValue('J'.$r, $sp->actual_stock ?? '');
            // K: Actual Stock — formula =J{r}
            $sheet->setCellValue('K'.$r, '=J'.$r);
            // L: Unit (not in DB, default 'Ea')
            $sheet->setCellValue('L'.$r, 'Ea');
            // M: Resource (not in DB, leave empty)
            $sheet->setCellValue('M'.$r, '');
            // N: Last PO Number
            $sheet->setCellValue('N'.$r, $sp->last_po_number ?? '');
            // O: Last PO Supplier
            $sheet->setCellValue('O'.$r, $sp->last_supplier ?? '');
            // P: GR Date
            $sheet->setCellValue('P'.$r, $grDate);
            // Q: Value per pcs
            if ($valuePer > 0) {
                $sheet->setCellValue('Q'.$r, $valuePer);
            }
            // R: Total Stock Value — formula =K{r}*Q{r}
            $sheet->setCellValue('R'.$r, '=K'.$r.'*Q'.$r);
            // S: Rank
            $sheet->setCellValue('S'.$r, $sp->rank ?? '');
            // T: Status — formula
            $sheet->setCellValue('T'.$r, '=IF(J'.$r.'<>"",IF(I'.$r.'>J'.$r.',"NG",IF(I'.$r.'*1.1>=J'.$r.',"ATTENTION","OK")),"")');
            // U: Status emoji — formula
            $sheet->setCellValue('U'.$r, '=IF(J'.$r.'<>"",IF(I'.$r.'>J'.$r.',"😡",IF(I'.$r.'*1.1>=J'.$r.',"😮","😊")),"")');

            // ── Styling ──
            $sheet->getStyle('B'.$r.':U'.$r)->applyFromArray($borderThin);
            $sheet->getStyle('B'.$r)->applyFromArray($center);
            $sheet->getStyle('I'.$r.':K'.$r)->applyFromArray($center);
            $sheet->getStyle('L'.$r)->applyFromArray($center);
            $sheet->getStyle('M'.$r)->applyFromArray($center);
            $sheet->getStyle('S'.$r)->applyFromArray($center);
            $sheet->getStyle('T'.$r.':U'.$r)->applyFromArray($center);

            // Currency formatting for Q (Value per pcs) and R (Total Stock Value)
            $sheet->getStyle('Q'.$r)->getNumberFormat()->setFormatCode($currencyFormat);
            $sheet->getStyle('R'.$r)->getNumberFormat()->setFormatCode($currencyFormat);

            // Rank coloring in column S
            $rank = strtoupper($sp->rank ?? '');
            if ($rank === 'A') {
                $sheet->getStyle('S'.$r)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFCC4125']],
                    'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
                ]);
            } elseif ($rank === 'B') {
                $sheet->getStyle('S'.$r)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFFF00']],
                ]);
            } elseif ($rank === 'C') {
                $sheet->getStyle('S'.$r)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF00FF00']],
                    'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
                ]);
            }

            // Status conditional coloring for column T
            $status = strtoupper($sp->status ?? '');
            if ($status === 'OK') {
                $sheet->getStyle('T'.$r)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FF00B050']],
                    'font' => ['color' => ['argb' => Color::COLOR_WHITE], 'bold' => true],
                ]);
            } elseif ($status === 'ATTENTION') {
                $sheet->getStyle('T'.$r)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFFFC000']],
                    'font' => ['color' => ['argb' => Color::COLOR_BLACK], 'bold' => true],
                ]);
            } elseif ($status === 'NG') {
                $sheet->getStyle('T'.$r)->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['argb' => 'FFC00000']],
                    'font' => ['color' => ['argb' => Color::COLOR_WHITE], 'bold' => true],
                ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UTILITY HELPERS
    |--------------------------------------------------------------------------
    */

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

    private static function rackBinLabel(Sparepart $sp): string
    {
        if (! $sp->bin) {
            return '';
        }
        $rackCode = $sp->bin->rack?->code ?? '';
        $binCode  = $sp->bin->code ?? '';

        if (empty($rackCode) && empty($binCode)) {
            return '';
        }

        return "{$rackCode}{$binCode}";
    }

    private static function formatGrDate(mixed $value): string
    {
        if (empty($value)) {
            return '';
        }
        try {
            return \Illuminate\Support\Carbon::parse($value)->format('d/m/Y');
        } catch (\Throwable) {
            return (string) $value;
        }
    }
}
