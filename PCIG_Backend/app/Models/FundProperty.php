<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FundProperty extends Model
{
    use HasFactory;

    protected $fillable = [
        'fund_id',
        'property_id',
        'allocation_percentage',
        'allocation_amount',
    ];

    protected $casts = [
        'allocation_percentage' => 'decimal:2',
        'allocation_amount' => 'decimal:2',
    ];

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
