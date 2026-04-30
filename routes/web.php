<?php

use App\Http\Controllers\SparepartController;
use App\Http\Controllers\StockController;

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Spareparts CRUD
    Route::resource('spareparts', SparepartController::class);

    // Stock Control
    Route::prefix('stock')->name('stock.')->group(function () {
        Route::get('/in/{sparepart}', [StockController::class, 'inForm'])->name('in.form');
        Route::post('/in/{sparepart}', [StockController::class, 'in'])->name('in');
        Route::get('/out/{sparepart}', [StockController::class, 'outForm'])->name('out.form');
        Route::post('/out/{sparepart}', [StockController::class, 'out'])->name('out');
    });
});

require __DIR__.'/settings.php';
