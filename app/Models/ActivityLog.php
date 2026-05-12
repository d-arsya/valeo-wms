<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ActivityLog extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityLogFactory> */
    use HasFactory;

    protected $table = 'activity_logs';

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

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::creating(function ($activityLog) {
            if (empty($activityLog->control_id)) {
                $activityLog->control_id = 'CTL-' . strtoupper(Str::random(8));
            }

            if (empty($activityLog->performed_at)) {
                $activityLog->performed_at = now();
            }
        });
    }

    /**
     * Scope a query to filter activity logs.
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['from'] ?? null, function ($query, $from) {
            $query->whereDate('performed_at', '>=', $from);
        })->when($filters['to'] ?? null, function ($query, $to) {
            $query->whereDate('performed_at', '<=', $to);
        })->when($filters['type'] ?? null, function ($query, $type) {
            if ($type !== 'all') {
                $query->where('type', $type);
            }
        })->when($filters['control_id'] ?? null, function ($query, $controlId) {
            $query->where('control_id', 'like', "%{$controlId}%");
        })->when($filters['search'] ?? null, function ($query, $search) {
            $query->whereHas('sparepart', function ($q) use ($search) {
                $q->where('material_number', 'like', "%{$search}%")
                    ->orWhere('part_name', 'like', "%{$search}%");
            });
        });
    }
}
