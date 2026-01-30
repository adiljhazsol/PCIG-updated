<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FIFAImportError extends Model
{
    use HasFactory;

    protected $table = 'fifa_import_errors';

    protected $fillable = [
        'import_id',
        'row_number',
        'error_message',
        'row_data',
    ];

    protected $casts = [
        'row_data' => 'array',
    ];

    public function import()
    {
        return $this->belongsTo(FIFAImport::class, 'import_id');
    }
}
