<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'state',
        'county',
        'city',
        'rules',
        'fees',
        'contact_info',
    ];

    protected $casts = [
        'rules' => 'array',
        'fees' => 'array',
        'contact_info' => 'array',
    ];
}
