<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Reset est_value to NULL for all properties to avoid casting errors with existing formatted strings
DB::table('properties')->update(['est_value' => null]);

echo "Reset est_value to NULL.\n";
