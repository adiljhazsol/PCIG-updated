<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurplusFundContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'surplus_fund_id',
        'contact_date',
        'type',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'contact_date' => 'date',
    ];

    public function surplusFund(): BelongsTo
    {
        return $this->belongsTo(SurplusFund::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
