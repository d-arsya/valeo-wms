<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $_request)
    {
        $stats = Cache::remember('dashboard.stats', now()->addSeconds(30), function () {
            return [
                'total_spareparts' => DB::table('spareparts')->count('id'),
                'total_actual_stock' => DB::table('spareparts')->sum('actual_stock'),
                'status_counts' => [
                    'ok' => DB::table('spareparts')->where('status', 'OK')->count('id'),
                    'attention' => DB::table('spareparts')->where('status', 'ATTENTION')->count('id'),
                    'ng' => DB::table('spareparts')->where('status', 'NG')->count('id'),
                ],
            ];
        });

        $stats['recent_activities'] = ActivityLog::query()
            ->with(['sparepart', 'user'])
            ->orderBy('performed_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
