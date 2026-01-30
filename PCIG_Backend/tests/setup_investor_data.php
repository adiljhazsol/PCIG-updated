<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'investor@pcig.com';
$password = 'password';

$user = User::where('email', $email)->first();

if (!$user) {
    echo "Creating investor user...\n";
    $user = User::create([
        'name' => 'Investor User',
        'email' => $email,
        'password' => Hash::make($password),
        'role' => 'investor',
        'role_type' => 'investor',
    ]);
    echo "Investor user created with ID: " . $user->id . "\n";
} else {
    echo "Investor user already exists. ID: " . $user->id . "\n";
    // Reset password to ensure it matches
    $user->password = Hash::make($password);
    $user->role_type = 'investor';
    $user->save();
    echo "Password reset to 'password'.\n";
}

// Ensure at least one property exists
use App\Models\Property;
$property = Property::first();
if (!$property) {
    echo "Creating a test property...\n";
    $property = Property::create([
        'address' => '123 Investment Lane',
        'city' => 'Finance City',
        'state' => 'NY',
        'zip_code' => '10001',
        'type' => 'Residential',
        'status' => 'active',
        'price_per_share' => 100,
        'total_shares' => 1000,
        'available_shares' => 1000,
        'roi' => 10.5,
    ]);
    echo "Property created with ID: " . $property->id . "\n";
} else {
    echo "Property exists with ID: " . $property->id . "\n";
}

// Ensure the investor has an investment in this property for testing
use App\Models\Investment;
$investment = Investment::where('user_id', $user->id)
    ->where('property_id', $property->id)
    ->first();

if (!$investment) {
    echo "Creating investment for user...\n";
    Investment::create([
        'user_id' => $user->id,
        'property_id' => $property->id,
        'shares' => 10,
        'amount' => 1000,
        'price_per_share' => 100,
        'purchase_date' => now(),
        'status' => 'active',
    ]);
    echo "Investment created.\n";
} else {
    echo "Investment exists.\n";
}
