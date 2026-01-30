<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParcelInteraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'parcel_research_id',
        'type',
        'notes',
        'user_id',
    ];

    public function research()
    {
        return $this->belongsTo(ParcelResearch::class, 'parcel_research_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
