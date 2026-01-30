<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'total_amount',
        'payment_count',
        'status',
        'processed_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class, 'batch_id');
    }
}
