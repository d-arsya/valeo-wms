<?php
namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

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

        return $pdf->download('WMS_Activity_Report_' . now()->format('Ymd_His') . '.pdf');
    }
}
