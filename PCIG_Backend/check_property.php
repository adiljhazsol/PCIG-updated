<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Property;

$property = Property::first();
if ($property) {
    echo "ID: " . $property->id . "\n";
    echo "Current Value: " . var_export($property->current_value, true) . "\n";
    echo "ROI: " . var_export($property->roi, true) . "\n";
    echo "Price Per Share: " . var_export($property->price_per_share, true) . "\n";
    
    // Check if redemption_deadline accessor exists or if it's on a relationship
    echo "Redemption Deadline Accessor: " . (method_exists($property, 'getRedemptionDeadlineAttribute') ? 'Yes' : 'No') . "\n";
    echo "Redemption Deadline Value: " . var_export($property->redemption_deadline, true) . "\n";
    
    // Check relationships
    $property->load('redemptionTracking');
    echo "Redemption Tracking: " . ($property->redemptionTracking ? 'Found' : 'Null') . "\n";
    if ($property->redemptionTracking) {
        echo "Redemption Date: " . $property->redemptionTracking->redemption_deadline . "\n";
    }
} else {
    echo "No properties found.\n";
}
