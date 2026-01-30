<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExportLog extends Model
{
    use HasFactory;

    protected $table = 'exports_logs';

    protected $fillable = [
        'type',
        'file_path',
        'exported_by',
        'exported_at',
    ];

    protected $casts = [
        'exported_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'exported_by');
    }
}
