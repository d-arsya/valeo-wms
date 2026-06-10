<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Bin;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Rack;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Database\Seeder;

class SparepartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = Brand::factory()->count(5)->create();
        $categories = Category::factory()->count(4)->create();
        $racks = Rack::factory()->count(3)->create();

        $bins = collect();
        foreach ($racks as $rack) {
            $bins = $bins->concat(Bin::factory()->count(5)->create(['rack_id' => $rack->id]));
        }

        $user = User::first();

        Sparepart::factory()
            ->count(30)
            ->recycle($brands)
            ->recycle($categories)
            ->recycle($bins)
            ->has(ActivityLog::factory()->count(5)->state(fn (array $attributes, Sparepart $sparepart) => [
                'user_id' => $user->id,
            ]), 'activityLogs')
            ->create();
    }
}
