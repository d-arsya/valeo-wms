<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $stats = [
            'total_spareparts' => Sparepart::count(),
            'total_actual_stock' => Sparepart::sum('actual_stock'),
            'status_counts' => [
                'ok' => Sparepart::where('status', 'OK')->count(),
                'attention' => Sparepart::where('status', 'ATTENTION')->count(),
                'ng' => Sparepart::where('status', 'NG')->count(),
            ],
            'recent_activities' => ActivityLog::with(['sparepart', 'user'])
                ->orderBy('performed_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats
        ]);
    }
}
