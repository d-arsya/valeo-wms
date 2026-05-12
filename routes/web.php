<?php

use App\Http\Controllers\SparepartController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\ReportController;

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // QR Scanner
    Route::inertia('scanner', 'scanner/Index')->name('scanner.index');

    // Spareparts CRUD
    Route::resource('spareparts', SparepartController::class);

    // Stock Control
    Route::prefix('stock')->name('stock.')->group(function () {
        Route::get('/in/{sparepart}', [StockController::class, 'inForm'])->name('in.form');
        Route::post('/in/{sparepart}', [StockController::class, 'in'])->name('in');
        Route::get('/out/{sparepart}', [StockController::class, 'outForm'])->name('out.form');
        Route::post('/out/{sparepart}', [StockController::class, 'out'])->name('out');
    });

    // QR Label
    Route::get('spareparts/{sparepart}/label', [QrCodeController::class, 'show'])->name('spareparts.label');
    Route::post('spareparts/{sparepart}/qr', [QrCodeController::class, 'generate'])->name('spareparts.qr.generate');

    // Reports
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
});

require __DIR__.'/settings.php';
