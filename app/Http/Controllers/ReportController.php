<?php
namespace App\Http\Controllers;

use App\Models\ActivityLog;
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
}
