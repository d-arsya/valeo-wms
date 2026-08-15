<?php

namespace Tests\Feature\Stock;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_technician_can_perform_stock_out_and_activity_is_logged(): void
    {
        $user = User::factory()->technician()->create();
        $sparepart = Sparepart::factory()->create([
            'actual_stock' => 10,
            'safety_stock' => 3,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('stock.out', $sparepart), [
                'quantity' => 4,
                'remarks' => 'Dipakai untuk line produksi',
            ]);

        $response->assertRedirect(route('spareparts.show', $sparepart));

        $this->assertSame(6, $sparepart->fresh()->actual_stock);

        $activityLog = ActivityLog::query()->latest()->first();

        $this->assertNotNull($activityLog);
        $this->assertSame('OUT', $activityLog->type);
        $this->assertSame(4, $activityLog->quantity);
        $this->assertSame($user->id, $activityLog->user_id);
        $this->assertSame($sparepart->id, $activityLog->sparepart_id);
    }

    public function test_stock_out_is_rejected_when_quantity_exceeds_the_latest_stock(): void
    {
        $user = User::factory()->technician()->create();
        $sparepart = Sparepart::factory()->create([
            'actual_stock' => 2,
            'safety_stock' => 1,
        ]);

        $response = $this
            ->from(route('stock.out.form', $sparepart))
            ->actingAs($user)
            ->post(route('stock.out', $sparepart), [
                'quantity' => 5,
                'remarks' => 'Melebihi stok',
            ]);

        $response
            ->assertRedirect(route('stock.out.form', $sparepart))
            ->assertSessionHasErrors('quantity');

        $this->assertSame(2, $sparepart->fresh()->actual_stock);
        $this->assertCount(0, ActivityLog::query()->get());
    }
}
