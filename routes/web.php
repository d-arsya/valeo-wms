<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QrCodeController;
use App\Http\Controllers\QrCodePrintController;
use App\Http\Controllers\RackController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Admin Only Routes
    Route::middleware('admin')->group(function () {
        // User Management
        Route::resource('users', UserController::class);

        // Master Data
        Route::resource('brands', BrandController::class);
        Route::resource('categories', CategoryController::class);
        Route::resource('racks', RackController::class);

        // Spareparts Create/Edit/Destroy
        Route::resource('spareparts', SparepartController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);

        // QR Label (Admin Only)
        Route::get('spareparts/{sparepart}/label', [QrCodeController::class, 'show'])->name('spareparts.label');
    });

    // Spareparts Index & Show (All authenticated users)
    Route::resource('spareparts', SparepartController::class)->only(['index']);
    Route::get('spareparts/{sparepart:material_number}', [SparepartController::class, 'show'])->name('spareparts.show');
    Route::get('spareparts/export/master-list', [SparepartController::class, 'exportMasterList'])
        ->middleware('throttle:report-export')
        ->name('spareparts.export-master-list');

    // QR Scanner (All authenticated users)
    Route::inertia('scanner', 'scanner/Index')->name('scanner.index');

    // Stock Control
    Route::prefix('stock')->name('stock.')->group(function () {
        // Stock In - Admin Only
        Route::middleware('admin')->group(function () {
            Route::get('/in/{sparepart}', [StockController::class, 'inForm'])->name('in.form');
            Route::post('/in/{sparepart}', [StockController::class, 'in'])
                ->middleware('throttle:stock-transactions')
                ->name('in');
        });

        // Stock Out - All authenticated users
        Route::get('/out/{sparepart}', [StockController::class, 'outFormView'])->name('out.form');
        Route::post('/out/{sparepart}', [StockController::class, 'out'])
            ->middleware('throttle:stock-transactions')
            ->name('out');
    });

    // Reports (All authenticated users)
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])
        ->middleware('throttle:report-export')
        ->name('reports.export');
    Route::get('reports/export/excel', [ReportController::class, 'exportExcel'])
        ->middleware('throttle:report-export')
        ->name('reports.export-excel');

    // QR Code Mass Print (Admin Only)
    Route::middleware('admin')->group(function () {
        Route::get('qr-codes/print', [QrCodePrintController::class, 'index'])->name('qr.print');
        Route::post('qr-codes/print/generate', [QrCodePrintController::class, 'generate'])
            ->middleware('throttle:qr-print')
            ->name('qr.print.generate');
        Route::post('qr-codes/print/preview', [QrCodePrintController::class, 'preview'])
            ->middleware('throttle:qr-print')
            ->name('qr.print.preview');
    });
});

require __DIR__.'/settings.php';
