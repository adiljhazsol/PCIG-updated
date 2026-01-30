<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoticeLog extends Model
{
    use HasFactory;

    protected $table = 'notices_logs';

    protected $fillable = [
        'notice_id',
        'sent_to',
        'sent_at',
        'status',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];
}
