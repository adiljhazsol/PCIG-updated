<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Fund;
use App\Models\Distribution;

class FundInvestment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fund_id',
        'shares',
        'amount',
        'price_per_share',
        'purchase_date',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'price_per_share' => 'decimal:2',
        'purchase_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class, 'fund_investment_id');
    }
}
