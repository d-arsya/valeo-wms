<?php

namespace App\Actions\Stock;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StockInAction
{
    public function execute(Sparepart $sparepart, array $data, ?int $userId): void
    {
        DB::transaction(function () use ($sparepart, $data, $userId) {
            $lockedSparepart = Sparepart::query()
                ->whereKey($sparepart->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $lockedSparepart->update([
                'actual_stock' => $lockedSparepart->actual_stock + $data['quantity'],
                'last_po_number' => $data['po_number'],
                'last_supplier' => $data['supplier'],
                'last_gr_date' => $data['gr_date'],
                'price_per_unit' => $data['price_per_unit'],
            ]);

            ActivityLog::create([
                'sparepart_id' => $lockedSparepart->id,
                'user_id' => $userId,
                'type' => 'IN',
                'quantity' => $data['quantity'],
                'remarks' => $data['remarks'] ?? null,
                'po_number' => $data['po_number'],
                'gr_date' => $data['gr_date'],
                'price_per_unit' => $data['price_per_unit'],
            ]);
        });

        Cache::forget('dashboard.stats');
    }
}
