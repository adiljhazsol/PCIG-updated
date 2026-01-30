<?php

use App\Models\ShareListing;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Share Listing Count: " . ShareListing::count() . "\n";
echo "Active Share Listing Count: " . ShareListing::where('status', 'active')->count() . "\n";

if (ShareListing::count() > 0) {
    echo "First Listing: " . json_encode(ShareListing::first()->toArray(), JSON_PRETTY_PRINT) . "\n";
}
