<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FIFAImport extends Model
{
    use HasFactory;

    protected $table = 'fifa_imports';

    protected $fillable = [
        'file_path',
        'file_name',
        'status',
        'total_rows',
        'processed_rows',
        'success_count',
        'error_count',
        'imported_by',
        'errors',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'errors' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function importedBy()
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function properties()
    {
        return $this->hasMany(Property::class, 'fifa_import_id');
    }

    public function errors()
    {
        return $this->hasMany(FIFAImportError::class, 'import_id');
    }
}
