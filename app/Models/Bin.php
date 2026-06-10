<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bin extends Model
{
    use HasFactory;

    protected $fillable = ['rack_id', 'code'];

    public function rack()
    {
        return $this->belongsTo(Rack::class);
    }

    public function spareparts()
    {
        return $this->hasMany(Sparepart::class);
    }
}
