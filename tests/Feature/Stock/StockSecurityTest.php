<?php

namespace Tests\Feature\Stock;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_in_sanitizes_text_fields_before_persisting(): void
    {
        $user = User::factory()->technician()->create();
        $sparepart = Sparepart::factory()->create([
            'actual_stock' => 5,
        ]);

        $this
            ->actingAs($user)
            ->post(route('stock.in', $sparepart), [
                'quantity' => 2,
                'po_number' => '<script>alert(1)</script>PO-123',
                'supplier' => '<b>Supplier Aman</b>',
                'gr_date' => '2026-06-14',
                'price_per_unit' => 12000,
                'remarks' => '<img src=x onerror=alert(1)> Tambah stok',
            ])
            ->assertRedirect(route('spareparts.show', $sparepart));

        $sparepart->refresh();
        $activityLog = ActivityLog::query()->latest()->first();

        $this->assertSame('PO-123', $sparepart->last_po_number);
        $this->assertSame('Supplier Aman', $sparepart->last_supplier);
        $this->assertNotNull($activityLog);
        $this->assertSame('Tambah stok', $activityLog->remarks);
    }

    public function test_stock_routes_are_rate_limited(): void
    {
        $user = User::factory()->technician()->create();
        $sparepart = Sparepart::factory()->create([
            'actual_stock' => 100,
        ]);

        for ($i = 0; $i < 30; $i++) {
            $this
                ->actingAs($user)
                ->post(route('stock.in', $sparepart), [
                    'quantity' => 1,
                    'po_number' => 'PO-'.$i,
                    'supplier' => 'Supplier '.$i,
                    'gr_date' => '2026-06-14',
                    'price_per_unit' => 1000,
                    'remarks' => 'Restock '.$i,
                ])
                ->assertRedirect(route('spareparts.show', $sparepart));
        }

        $this
            ->actingAs($user)
            ->post(route('stock.in', $sparepart), [
                'quantity' => 1,
                'po_number' => 'PO-final',
                'supplier' => 'Supplier Final',
                'gr_date' => '2026-06-14',
                'price_per_unit' => 1000,
                'remarks' => 'Restock final',
            ])
            ->assertStatus(429);
    }
}
