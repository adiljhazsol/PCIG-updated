<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\ShareListing;

class ShareTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'buyer_id',
        'seller_id',
        'shares',
        'total_price',
        'transaction_date',
        'status',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function listing()
    {
        return $this->belongsTo(ShareListing::class, 'listing_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
