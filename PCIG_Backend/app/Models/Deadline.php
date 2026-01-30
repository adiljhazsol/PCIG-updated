<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deadline extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'type',
        'deadline_date',
        'description',
        'status',
        'notified_at',
    ];

    protected $casts = [
        'deadline_date' => 'date',
        'notified_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
