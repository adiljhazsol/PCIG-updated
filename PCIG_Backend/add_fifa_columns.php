<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

Schema::table('properties', function (Blueprint $table) {
    if (!Schema::hasColumn('properties', 'owner')) {
        $table->string('owner')->nullable();
    }
    if (!Schema::hasColumn('properties', 'assigned_user_id')) {
        $table->unsignedBigInteger('assigned_user_id')->nullable();
    }
    if (!Schema::hasColumn('properties', 'tax_year')) {
        $table->year('tax_year')->nullable();
    }
    if (!Schema::hasColumn('properties', 'sheriff_file_number')) {
        $table->string('sheriff_file_number')->nullable();
    }
});

echo "Columns added successfully.\n";
