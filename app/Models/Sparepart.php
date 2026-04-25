<?php

namespace App\Models;

use App\Models\Traits\HasStockStatus;
use App\Observers\SparepartObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(SparepartObserver::class)]
class Sparepart extends Model
{
    /** @use HasFactory<\Database\Factories\SparepartFactory> */
    use HasFactory, HasStockStatus;

    protected $fillable = [
        'material_number',
        'part_name',
        'specification',
        'brand_id',
        'category_id',
        'bin_id',
        'safety_stock',
        'actual_stock',
        'last_po_number',
        'last_supplier',
        'last_gr_date',
        'price_per_unit',
        'status',
        'qr_code_path',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function bin()
    {
        return $this->belongsTo(Bin::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}
