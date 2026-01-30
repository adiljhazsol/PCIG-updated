<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\SheriffSale;
use App\Models\RedemptionTracking;
use App\Models\BarmentCase;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'parcel_id',
        'fifa_import_id',
        'property_code',
        'address',
        'location',
        'city',
        'county',
        'state',
        'zip_code',
        'status',
        'workflow_stage',
        'purchase_price',
        'current_value',
        'roi',
        'total_shares',
        'available_shares',
        'price_per_share',
        'purchase_date',
        'owner',
        'assigned_user_id',
        'tax_year',
        'sheriff_file_number',
    ];

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'current_value' => 'decimal:2',
        'roi' => 'decimal:2',
        'price_per_share' => 'decimal:2',
        'purchase_date' => 'date',
    ];

    public function fifaImport()
    {
        return $this->belongsTo(FIFAImport::class, 'fifa_import_id');
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function depreciations()
    {
        return $this->hasMany(Depreciation::class);
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(PropertyImage::class)->where('is_primary', true);
    }

    public function documents()
    {
        return $this->hasMany(PropertyDocument::class);
    }

    public function sheriffSale()
    {
        return $this->hasOne(SheriffSale::class);
    }

    public function redemptionTracking()
    {
        return $this->hasOne(RedemptionTracking::class);
    }

    public function barmentCase()
    {
        return $this->hasOne(BarmentCase::class);
    }

    public function quietTitleCase()
    {
        return $this->hasOne(QuietTitleCase::class);
    }

    public function auction()
    {
        return $this->hasOne(Auction::class);
    }

    public function reoProperty()
    {
        return $this->hasOne(ReoProperty::class);
    }

    public function reoLease()
    {
        return $this->hasOne(ReoLease::class)->where('status', 'active');
    }

    public function reoLeases()
    {
        return $this->hasMany(ReoLease::class);
    }

    public function taxAppeals()
    {
        return $this->hasMany(TaxAppeal::class);
    }
}
