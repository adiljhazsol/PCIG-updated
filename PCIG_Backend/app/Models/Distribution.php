<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Distribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_id',
        'fund_investment_id',
        'user_id',
        'property_id',
        'fund_id',
        'amount',
        'distribution_date',
        'status',
        'description',
        'reference_number',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'distribution_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function investment()
    {
        return $this->belongsTo(Investment::class);
    }

    public function fundInvestment()
    {
        return $this->belongsTo(FundInvestment::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }
}
