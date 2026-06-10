<?php

namespace Database\Seeders;

use App\Enums\UserRole;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => UserRole::ADMIN,
            'password' => bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Technician User',
            'email' => 'tech@example.com',
            'role' => UserRole::TECHNICIAN,
            'password' => bcrypt('password'),
        ]);

        // $this->call([
        //     SparepartSeeder::class,
        // ]);
    }
}
