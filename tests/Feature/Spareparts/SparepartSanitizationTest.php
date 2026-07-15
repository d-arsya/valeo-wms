<?php

namespace Tests\Feature\Spareparts;

use App\Models\Bin;
use App\Models\Brand;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SparepartSanitizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_sparepart_text_fields_are_sanitized_before_storage(): void
    {
        $user = User::factory()->admin()->create();

        $this
            ->actingAs($user)
            ->post(route('spareparts.store'), [
                'material_number' => ' MAT-SEC-001 ',
                'part_name' => '<script>alert(1)</script>Bearing <b>Depan</b>',
                'specification' => '<div>Spek <strong>Aman</strong></div>',
                'rank' => ' A ',
                'brand_id' => Brand::factory()->create()->id,
                'category_id' => Category::factory()->create()->id,
                'bin_id' => Bin::factory()->create()->id,
                'safety_stock' => 5,
                'actual_stock' => 10,
                'last_po_number' => '<script>bad()</script>PO-NEW',
                'last_supplier' => '<em>Supplier Baru</em>',
                'last_gr_date' => '2026-06-14',
                'price_per_unit' => 9000,
            ])
            ->assertRedirect(route('spareparts.index'));

        $this->assertDatabaseHas('spareparts', [
            'material_number' => 'MAT-SEC-001',
            'part_name' => 'Bearing Depan',
            'specification' => 'Spek Aman',
            'rank' => 'A',
            'last_po_number' => 'PO-NEW',
            'last_supplier' => 'Supplier Baru',
        ]);
    }
}
