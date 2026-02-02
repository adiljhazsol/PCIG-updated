<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'address',
        'photo_path',
        'ssn_encrypted',
        'bank_account_encrypted',
        'dob',
        'citizenship',
        'address_street',
        'address_city',
        'address_state',
        'address_zip',
        'address_country',
        'employment_status',
        'annual_income',
        'source_of_funds',
        'routing_number',
        'is_accredited',
        'privacy_settings',
    ];

    protected $casts = [
        'ssn_encrypted' => 'encrypted',
        'bank_account_encrypted' => 'encrypted',
        'dob' => 'date',
        'is_accredited' => 'boolean',
        'privacy_settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
