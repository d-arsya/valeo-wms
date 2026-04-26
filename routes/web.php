<?php

use App\Http\Controllers\SparepartController;

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Spareparts CRUD
    Route::resource('spareparts', SparepartController::class);
});

require __DIR__.'/settings.php';
