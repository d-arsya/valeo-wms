<?php

namespace App\Observers;

use App\Models\Sparepart;

class SparepartObserver
{
    /**
     * Handle the Sparepart "saving" event.
     */
    public function saving(Sparepart $sparepart): void
    {
        $sparepart->status = $sparepart->calculateStockStatus();
    }

    /**
     * Handle the Sparepart "created" event.
     */
    public function created(Sparepart $sparepart): void
    {
        //
    }

    /**
     * Handle the Sparepart "updated" event.
     */
    public function updated(Sparepart $sparepart): void
    {
        //
    }

    /**
     * Handle the Sparepart "deleted" event.
     */
    public function deleted(Sparepart $sparepart): void
    {
        //
    }

    /**
     * Handle the Sparepart "restored" event.
     */
    public function restored(Sparepart $sparepart): void
    {
        //
    }

    /**
     * Handle the Sparepart "force deleted" event.
     */
    public function forceDeleted(Sparepart $sparepart): void
    {
        //
    }
}
