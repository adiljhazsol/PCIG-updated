<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Property;
use App\Models\RedemptionTracking;
use Carbon\Carbon;

$properties = Property::take(12)->get();

if ($properties->isEmpty()) {
    echo "No properties found to update.\n";
    exit;
}

foreach ($properties as $property) {
    // Update main property fields
    $property->roi = rand(8, 18) + (rand(0, 99) / 100);
    $property->current_value = rand(15000, 150000);
    $property->est_value = rand(150000, 500000);
    $property->price_per_share = rand(50, 500);
    $property->available_shares = rand(10, 100);
    $property->total_shares = 100;
    $property->purchase_price = rand(5000, 20000);
    $property->workflow_stage = 'redemption';
    $property->status = 'active';
    $property->save();

    // Update or create redemption tracking
    if (!$property->redemptionTracking) {
        $property->redemptionTracking()->create([
            'redemption_deadline' => Carbon::now()->addDays(rand(30, 180)),
            'status' => 'pending',
        ]);
    } else {
        $property->redemptionTracking->update([
            'redemption_deadline' => Carbon::now()->addDays(rand(30, 180)),
        ]);
    }
    
    echo "Updated Property ID: {$property->id}\n";
}

echo "Seeding completed.\n";
