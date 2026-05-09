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
        return Inertia::render('reports/Index', [
            'filters' => $request->only(['from', 'to', 'type', 'search']),
        ]);
    }

    /**
     * Export the report as PDF.
     */
    public function export(Request $request)
    {
        // Placeholder for PDF export logic
        // Worker-Backend should implement this using DomPDF or Browsershot
        return response()->json(['message' => 'Export logic not implemented yet'], 501);
    }
}
