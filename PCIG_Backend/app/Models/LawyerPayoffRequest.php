<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LawyerPayoffRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'lawyer_name',
        'lawyer_email',
        'lawyer_phone',
        'firm_name',
        'client_name',
        'amount',
        'status',
        'notes',
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_zip',
        'payment_method',
        'payment_status',
        'transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
