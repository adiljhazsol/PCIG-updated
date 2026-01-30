<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Depreciation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'tax_year',
        'asset_basis',
        'depreciation_amount',
        'method',
        'useful_life_years',
        'created_by',
    ];

    protected $casts = [
        'asset_basis' => 'decimal:2',
        'depreciation_amount' => 'decimal:2',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
