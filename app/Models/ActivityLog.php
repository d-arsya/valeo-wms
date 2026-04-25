<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityLogFactory> */
    use HasFactory;

    protected $fillable = [
        'sparepart_id',
        'user_id',
        'control_id',
        'type',
        'quantity',
        'remarks',
        'po_number',
        'gr_date',
        'price_per_unit',
        'performed_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sparepart()
    {
        return $this->belongsTo(Sparepart::class);
    }
}
