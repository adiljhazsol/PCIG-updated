<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RedemptionTracking extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'redemption_deadline',
        'status',
        'redeemed_at',
        'redemption_amount',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'redemption_deadline' => 'date',
        'redeemed_at' => 'date',
        'redemption_amount' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
