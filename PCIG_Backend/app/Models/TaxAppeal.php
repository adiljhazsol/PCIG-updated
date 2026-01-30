<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaxAppeal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'filed_date',
        'hearing_date',
        'current_assessment',
        'proposed_assessment',
        'status',
        'outcome',
        'savings',
        'notes',
    ];

    protected $casts = [
        'filed_date' => 'date',
        'hearing_date' => 'date',
        'current_assessment' => 'decimal:2',
        'proposed_assessment' => 'decimal:2',
        'savings' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
