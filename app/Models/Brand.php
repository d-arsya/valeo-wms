<?php

namespace App\Models;

use App\Models\Traits\HasNameSearch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory, HasNameSearch;

    protected $fillable = ['name'];

    public function spareparts()
    {
        return $this->hasMany(Sparepart::class);
    }
}
