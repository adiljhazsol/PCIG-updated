<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReoProperty extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'acquisition_date',
        'disposition_strategy',
        'listed_price',
        'status',
        'listing_agent',
        'listing_date',
        'notes',
    ];

    protected $casts = [
        'acquisition_date' => 'date',
        'listed_price' => 'decimal:2',
        'listing_date' => 'date',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function offers()
    {
        return $this->hasMany(ReoOffer::class);
    }
}
