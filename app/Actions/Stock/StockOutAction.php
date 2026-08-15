<?php

namespace App\Actions\Stock;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockOutAction
{
    public function execute(Sparepart $sparepart, array $data, int $userId): void
    {
        DB::transaction(function () use ($sparepart, $data, $userId) {
            $lockedSparepart = Sparepart::query()
                ->whereKey($sparepart->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($data['quantity'] > $lockedSparepart->actual_stock) {
                throw ValidationException::withMessages([
                    'quantity' => "The quantity exceeds the current actual stock ({$lockedSparepart->actual_stock}).",
                ]);
            }

            $lockedSparepart->update([
                'actual_stock' => $lockedSparepart->actual_stock - $data['quantity'],
            ]);

            ActivityLog::create([
                'sparepart_id' => $lockedSparepart->id,
                'user_id' => $userId,
                'type' => 'OUT',
                'quantity' => $data['quantity'],
                'remarks' => $data['remarks'] ?? null,
            ]);
        });

        Cache::forget('dashboard.stats');
    }
}
