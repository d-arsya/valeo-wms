<?php

namespace Tests\Feature\Spareparts;

use App\Models\Bin;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SparepartAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_technician_cannot_create_sparepart_master_data(): void
    {
        $user = User::factory()->technician()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('spareparts.store'), $this->payload());

        $response->assertForbidden();
        $this->assertDatabaseCount('spareparts', 0);
    }

    public function test_admin_can_create_sparepart_master_data(): void
    {
        $user = User::factory()->admin()->create();
        $payload = $this->payload();

        $response = $this
            ->actingAs($user)
            ->post(route('spareparts.store'), $payload);

        $response->assertRedirect(route('spareparts.index'));

        $this->assertDatabaseHas('spareparts', [
            'material_number' => $payload['material_number'],
            'part_name' => $payload['part_name'],
        ]);
    }

    public function test_sparepart_index_still_renders_after_filter_cache_is_warmed(): void
    {
        Cache::flush();

        $user = User::factory()->admin()->create();
        $brand = Brand::factory()->create(['name' => 'Valeo Brand']);
        $category = Category::factory()->create(['name' => 'Electrical']);

        Sparepart::factory()->create([
            'material_number' => 'MAT-CACHE-001',
            'brand_id' => $brand->id,
            'category_id' => $category->id,
        ]);

        $this
            ->actingAs($user)
            ->get(route('spareparts.index'))
            ->assertOk()
            ->assertSeeText('MAT-CACHE-001')
            ->assertSeeText('Valeo Brand')
            ->assertSeeText('Electrical');

        $this
            ->actingAs($user)
            ->get(route('spareparts.index'))
            ->assertOk()
            ->assertSeeText('MAT-CACHE-001')
            ->assertSeeText('Valeo Brand')
            ->assertSeeText('Electrical');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            'material_number' => 'MAT-TEST-0001',
            'part_name' => 'Bearing Test',
            'specification' => 'Spec untuk pengujian otorisasi',
            'rank' => 'A',
            'brand_id' => Brand::factory()->create()->id,
            'category_id' => Category::factory()->create()->id,
            'bin_id' => Bin::factory()->create()->id,
            'safety_stock' => 5,
            'actual_stock' => 10,
            'last_po_number' => 'PO-001',
            'last_supplier' => 'Supplier Test',
            'last_gr_date' => '2026-06-14',
            'price_per_unit' => 10000,
        ];
    }
}
