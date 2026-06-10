<?php

namespace App\Models\Traits;

trait HasStockStatus
{
    /**
     * Calculate the stock status based on actual_stock and safety_stock.
     */
    public function calculateStockStatus(): string
    {
        if ($this->actual_stock <= 0) {
            return 'NG';
        }

        if ($this->actual_stock < $this->safety_stock) {
            return 'ATTENTION';
        }

        return 'OK';
    }
}
