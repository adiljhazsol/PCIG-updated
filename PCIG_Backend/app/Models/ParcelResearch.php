<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParcelResearch extends Model
{
    use HasFactory;

    protected $table = 'parcel_research';

    protected $fillable = [
        'parcel_id',
        'county',
        'research_notes',
        'researched_by',
        'researched_at',
        'owner_name',
        'owner_phone',
        'owner_email',
        'mailing_address',
        'status',
    ];

    protected $casts = [
        'researched_at' => 'datetime',
    ];

    public function researcher()
    {
        return $this->belongsTo(User::class, 'researched_by');
    }

    public function property()
    {
        return $this->belongsTo(Property::class, 'parcel_id', 'parcel_id');
    }

    public function documents()
    {
        return $this->hasMany(ParcelDocument::class);
    }

    public function interactions()
    {
        return $this->hasMany(ParcelInteraction::class);
    }
}
