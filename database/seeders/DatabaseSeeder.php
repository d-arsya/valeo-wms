<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * DEFAULT DATABASE SEEDER (Production Ready)
 * ===========================================
 * User default untuk login (jika belum ada user sama sekali):
 *   - ADMIN    : admin@example.com / password
 *   - TECHNICIAN: tech@example.com / password
 *
 * ProductionFromXlsxSeeder (DEFAULT BEHAVIOR):
 *   🔥 DEFAULTS di Class ProductionFromXlsxSeeder:
 *      $onlyFirst782    = true  → IMPORT DATA ASLI SAMPE A23000782 (782 DATA!)
 *      $maxSuffixLimit  = 782   → batas suffix numeric, ganti ke 819 jika ingin full 819 row
 *      $wipeBeforeRun   = true  → TRUNCATE 5 tabel master SEBELUM import (fresh install)
 *
 * JIKA INGIN UPDATE DATA (TIDAK HAPUS DATA LAMA):
 *   Jalankan via tinker / child class sebelum seed:
 *      $seeder = new ProductionFromXlsxSeeder();
 *      $seeder->wipeBeforeRun = false;
 *      $seeder->onlyFirst782 = true;        // tetap 782 data asli
 *      $seeder->maxSuffixLimit = 819;       // jika ingin import FULL 819 row
 *      $seeder->run();
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (User::where('email', 'admin@example.com')->doesntExist()) {
            User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => UserRole::ADMIN,
                'password' => 'password',
            ]);
        }

        if (User::where('email', 'tech@example.com')->doesntExist()) {
            User::factory()->create([
                'name' => 'Technician User',
                'email' => 'tech@example.com',
                'role' => UserRole::TECHNICIAN,
                'password' => 'password',
            ]);
        }

        $this->call([
            ProductionFromXlsxSeeder::class,
        ]);
    }
}
