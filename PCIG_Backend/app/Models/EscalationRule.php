<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EscalationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'trigger_type',
        'delay_hours',
        'escalate_to_user_id',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function escalateToUser()
    {
        return $this->belongsTo(User::class, 'escalate_to_user_id');
    }
}
