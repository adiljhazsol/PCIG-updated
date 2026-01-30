<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'template_id',
        'recipient_name',
        'recipient_address',
        'sent_date',
        'status',
        'file_path',
        'created_by',
    ];

    protected $casts = [
        'sent_date' => 'date',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(NoticeTemplate::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
