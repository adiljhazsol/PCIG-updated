<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\Distribution;

class Investment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'investment_id',
        'name',
        'type',
        'details',
        'property_id',
        'shares',
        'amount',
        'price_per_share',
        'purchase_date',
        'status',
        'status_color',
        'status_bg_color',
        'current_value',
        'interest',
        'interest_color',
        'depreciation',
        'depreciation_color',
        'returns',
        'returns_color',
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

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class);
    }
}
