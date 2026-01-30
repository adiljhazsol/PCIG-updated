<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarmentCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'filed_date',
        'status',
        'court_date',
        'court_outcome',
        'attorney_id',
        'filing_fee',
        'notes',
    ];

    protected $casts = [
        'filed_date' => 'date',
        'court_date' => 'date',
        'filing_fee' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function attorney()
    {
        return $this->belongsTo(User::class, 'attorney_id');
    }
}
