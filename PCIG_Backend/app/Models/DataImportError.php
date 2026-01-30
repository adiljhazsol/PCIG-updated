<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataImportError extends Model
{
    use HasFactory;

    protected $fillable = [
        'data_import_id',
        'row_number',
        'error_message',
        'row_data',
    ];

    protected $casts = [
        'row_data' => 'array',
    ];

    public function import(): BelongsTo
    {
        return $this->belongsTo(DataImport::class, 'data_import_id');
    }
}
