<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EfileCancellation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'filing_id',
        'reason',
        'requested_at',
        'status',
        'requested_by',
    ];

    protected $casts = [
        'requested_at' => 'date',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function requestor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
