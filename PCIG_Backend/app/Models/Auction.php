<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'auction_date',
        'location',
        'starting_bid',
        'winning_bid',
        'winner_info',
        'status',
        'notes',
    ];

    protected $casts = [
        'auction_date' => 'datetime',
        'starting_bid' => 'decimal:2',
        'winning_bid' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
