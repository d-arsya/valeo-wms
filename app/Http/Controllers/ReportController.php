<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display the reports index page.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['from', 'to', 'type', 'search', 'control_id']);

        $logs = ActivityLog::with(['sparepart', 'user'])
            ->filter($filters)
            ->orderBy('performed_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('reports/Index', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    /**
     * Export the filtered reports to PDF.
     */
    public function export(Request $request)
    {
        $filters = $request->only(['from', 'to', 'type', 'search', 'control_id']);

        $logs = ActivityLog::with(['sparepart', 'user'])
            ->filter($filters)
            ->orderBy('performed_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('reports.pdf', [
            'logs' => $logs,
            'filters' => $filters,
            'generated_at' => now()->format('d/m/Y H:i'),
        ]);

        return $pdf->download('WMS_Activity_Report_'.now()->format('Ymd_His').'.pdf');
    }

    /**
     * Export filtered reports to Excel (.xls) - native HTML table format.
     * Works 100% with Microsoft Excel, LibreOffice Calc and Google Sheets.
     * No extra library required (no PhpSpreadsheet / Maatwebsite needed).
     */
    public function exportExcel(Request $request)
    {
        $filters = $request->only(['from', 'to', 'type', 'search', 'control_id']);

        $logs = ActivityLog::with(['sparepart', 'user'])
            ->filter($filters)
            ->orderBy('performed_at', 'desc')
            ->get();

        $filename = 'WMS_Activity_Report_'.now()->format('Ymd_His').'.xls';

        // Build metadata lines for HTML → XLS
        $html = '<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="ProgId" content="Excel.Sheet">
<meta name="Generator" content="Valeo WMS">
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>Activity Report</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; }
  th { background-color: #4B5563; color: white; font-weight: bold; text-align: left; padding: 8px 10px; border: 1px solid #374151; }
  td { padding: 6px 10px; border: 1px solid #D1D5DB; vertical-align: top; }
  tr:nth-child(even) td { background-color: #F9FAFB; }
  .header-title { font-size: 16pt; font-weight: bold; color: #111827; margin-bottom: 2px; }
  .header-sub { font-size: 10pt; color: #6B7280; margin-bottom: 16px; }
  .status-in { color: #059669; font-weight: bold; }
  .status-out { color: #DC2626; font-weight: bold; }
  .num { text-align: right; }
</style>
<title>Valeo WMS Activity Report</title>
</head>
<body>
  <p class="header-title">Valeo WMS — Activity Report</p>
  <p class="header-sub">Generated: '.now()->format('d M Y H:i:s').'
  '.($filters['from'] ?? false ? ' | From: '.$filters['from'] : '').'
  '.($filters['to'] ?? false ? ' | To: '.$filters['to'] : '').'
  '.($filters['type'] ?? false && $filters['type'] !== 'all' ? ' | Type: '.strtoupper($filters['type']) : '').'
  '.($filters['search'] ?? false ? ' | Search: "'.e($filters['search']).'"' : '').'
  </p>
  <table>
    <thead>
      <tr>
        <th style="width:60px;">#</th>
        <th>Waktu Transaksi</th>
        <th>Control ID</th>
        <th>Material Number</th>
        <th>Part Name</th>
        <th>Status</th>
        <th class="num">Qty</th>
        <th>Operator</th>
        <th>Brand</th>
        <th>Category</th>
        <th>Rack/Bin</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>';

        if ($logs->count() === 0) {
            $html .= '<tr><td colspan="12" style="text-align:center;color:#6B7280;padding:20px;">No data found for the selected filters.</td></tr>';
        } else {
            foreach ($logs as $idx => $log) {
                $row = $idx + 1;
                $sparepart = $log->sparepart;
                $user = $log->user;
                $date = $log->performed_at ? date('d M Y H:i:s', strtotime($log->performed_at)) : '-';
                $typeClass = $log->type === 'IN' ? 'status-in' : 'status-out';
                $typeLabel = $log->type === 'IN' ? 'STOCK IN' : 'STOCK OUT';
                $qtyPrefix = $log->type === 'IN' ? '+' : '-';
                $matNo = e($sparepart?->material_number ?? '-');
                $partName = e($sparepart?->part_name ?? '-');
                $controlId = e($log->control_id ?? '-');
                $operator = e($user?->name ?? '-');
                $brand = e($sparepart?->brand?->name ?? '-');
                $category = e($sparepart?->category?->name ?? '-');
                $bin = '';
                if ($sparepart && $sparepart->bin) {
                    $rackCode = $sparepart->bin->rack?->code ?? '-';
                    $binCode = $sparepart->bin->code ?? '-';
                    $bin = e("{$rackCode} / {$binCode}");
                } else {
                    $bin = '-';
                }
                $remarks = e($log->remarks ?? '');
                $qty = (int) $log->quantity;

                $html .= "
      <tr>
        <td>{$row}</td>
        <td>{$date}</td>
        <td style=\"mso-number-format:'\\@';\">{$controlId}</td>
        <td style=\"mso-number-format:'\\@';\">{$matNo}</td>
        <td>{$partName}</td>
        <td class=\"{$typeClass}\">{$typeLabel}</td>
        <td class=\"num\">{$qtyPrefix}{$qty}</td>
        <td>{$operator}</td>
        <td>{$brand}</td>
        <td>{$category}</td>
        <td>{$bin}</td>
        <td>{$remarks}</td>
      </tr>";
            }
        }

        $html .= '
    </tbody>
  </table>
  <p style="color:#6B7280;font-size:9pt;margin-top:24px;">
    Total rows: '.$logs->count().' &nbsp; | &nbsp; Valeo WMS System
  </p>
</body>
</html>';

        return response()->streamDownload(function () use ($html) {
            echo $html;
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }
}
