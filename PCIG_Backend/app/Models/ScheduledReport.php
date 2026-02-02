<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduledReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'frequency',
        'next_run_at',
        'parameters',
        'recipients'
    ];

    protected $casts = [
        'parameters' => 'array',
        'recipients' => 'array',
        'next_run_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
