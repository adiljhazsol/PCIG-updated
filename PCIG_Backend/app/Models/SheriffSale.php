<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SheriffSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'sale_date',
        'status',
        'winning_bid',
        'winner_info',
        'notes',
    ];

    protected $casts = [
        'sale_date' => 'date',
        'winning_bid' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
