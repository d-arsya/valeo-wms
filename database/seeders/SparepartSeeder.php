<?php

namespace Database\Seeders;

use App\Models\Sparepart;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SparepartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = \App\Models\Brand::factory()->count(5)->create();
        $categories = \App\Models\Category::factory()->count(4)->create();
        $racks = \App\Models\Rack::factory()->count(3)->create();
        
        $bins = collect();
        foreach ($racks as $rack) {
            $bins = $bins->concat(\App\Models\Bin::factory()->count(5)->create(['rack_id' => $rack->id]));
        }

        $user = \App\Models\User::first();

        Sparepart::factory()
            ->count(30)
            ->recycle($brands)
            ->recycle($categories)
            ->recycle($bins)
            ->has(\App\Models\ActivityLog::factory()->count(5)->state(fn (array $attributes, Sparepart $sparepart) => [
                'user_id' => $user->id,
            ]), 'activityLogs')
            ->create();
    }
}
