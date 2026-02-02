<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Property;

echo "Starting query...\n";
try {
    $properties = Property::select('id', 'address', 'city', 'zip_code', 'workflow_stage')->get();
    echo "Properties found: " . $properties->count() . "\n";
    foreach($properties as $p) {
        echo $p->id . ": " . $p->address . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
