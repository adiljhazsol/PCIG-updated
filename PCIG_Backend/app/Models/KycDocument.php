<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KycDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'verification_id',
        'type',
        'file_path',
        'status',
    ];

    public function verification()
    {
        return $this->belongsTo(KycVerification::class, 'verification_id');
    }
}
