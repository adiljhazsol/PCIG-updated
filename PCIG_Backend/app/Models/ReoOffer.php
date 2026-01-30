<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReoOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'reo_property_id',
        'offer_amount',
        'buyer_info',
        'offer_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'offer_amount' => 'decimal:2',
        'offer_date' => 'date',
    ];

    public function reoProperty()
    {
        return $this->belongsTo(ReoProperty::class);
    }
}
