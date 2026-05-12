<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Sparepart;
use App\Models\ActivityLog;

$sparepart = Sparepart::first();
if (!$sparepart) {
    echo "No spareparts found.\n";
    exit;
}

echo "Sparepart ID: " . $sparepart->id . "\n";
echo "ActivityLogs Relationship count: " . $sparepart->activityLogs()->count() . "\n";
echo "ActivityLogs directly from DB: " . \Illuminate\Support\Facades\DB::table('activity_logs')->where('sparepart_id', $sparepart->id)->count() . "\n";

$loaded = $sparepart->load('activityLogs');
echo "Loaded relation count: " . count($loaded->activityLogs) . "\n";
echo "Loaded relation keys: " . implode(', ', array_keys($loaded->toArray())) . "\n";
