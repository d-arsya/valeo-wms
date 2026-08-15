<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasNameSearch
{
    public function scopeSearchByName(Builder $query, ?string $search): Builder
    {
        return $query->when($search, function (Builder $query, string $search) {
            $query->where('name', 'like', "%{$search}%");
        });
    }
}
