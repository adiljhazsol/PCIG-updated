<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Property;

try {
    echo "Querying properties...\n";
    $properties = Property::select('id', 'address', 'city', 'zip_code', 'workflow_stage')
            ->orderBy('address')
            ->get();
    echo "Found " . $properties->count() . " properties.\n";
    if ($properties->count() > 0) {
        echo "First property: " . $properties->first()->address . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
