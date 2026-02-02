<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fund extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'fund_code',
        'slug',
        'description',
        'image_path',
        'min_investment',
        'current_nav',
        'total_assets',
        'total_shares',
        'available_shares',
        'price_per_share',
        'status',
        'strategy',
        'target_irr',
        'lock_up_period',
        'performance_metric',
        'management_fee',
        'performance_fee',
        'cap',
        'launch_date',
        'prospectus_path',
        'term_sheet_path',
    ];

    protected $casts = [
        'min_investment' => 'decimal:2',
        'current_nav' => 'decimal:2',
        'total_assets' => 'decimal:2',
        'cap' => 'decimal:2',
        'price_per_share' => 'decimal:2',
        'performance_metric' => 'decimal:2',
        'management_fee' => 'decimal:2',
        'performance_fee' => 'decimal:2',
        'launch_date' => 'date',
    ];

    public function fundInvestments()
    {
        return $this->hasMany(FundInvestment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class);
    }

    public function fundProperties()
    {
        return $this->hasMany(FundProperty::class);
    }
}
