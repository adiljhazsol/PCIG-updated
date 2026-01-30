<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Property;
use App\Models\ShareTransaction;

class ShareListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'property_id',
        'shares',
        'price_per_share',
        'total_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'price_per_share' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function transactions()
    {
        return $this->hasMany(ShareTransaction::class, 'listing_id');
    }
}
