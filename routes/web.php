<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\RackController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // User Management (Admin Only)
    Route::middleware('admin')->group(function () {
        Route::resource('users', UserController::class);
    });

    // Master Data (All authenticated users)
    Route::resource('brands', BrandController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('racks', RackController::class);

    // QR Scanner
    Route::inertia('scanner', 'scanner/Index')->name('scanner.index');

    // Spareparts CRUD
    Route::resource('spareparts', SparepartController::class)->except('show');
    Route::get('spareparts/{sparepart:material_number}', [SparepartController::class, 'show'])->name('spareparts.show');

    // Stock Control
    Route::prefix('stock')->name('stock.')->group(function () {
        Route::get('/in/{sparepart}', [StockController::class, 'inForm'])->name('in.form');
        Route::post('/in/{sparepart}', [StockController::class, 'in'])
            ->middleware('throttle:stock-transactions')
            ->name('in');
        Route::get('/out/{sparepart}', [StockController::class, 'outFormView'])->name('out.form');
        Route::post('/out/{sparepart}', [StockController::class, 'out'])
            ->middleware('throttle:stock-transactions')
            ->name('out');
    });

    // QR Label
    Route::get('spareparts/{sparepart}/label', [QrCodeController::class, 'show'])->name('spareparts.label');

    // Reports
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])
        ->middleware('throttle:report-export')
        ->name('reports.export');
});

require __DIR__.'/settings.php';
