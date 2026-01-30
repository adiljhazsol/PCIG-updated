<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\Fund;
use App\Models\FundInvestment;
use App\Models\Transaction;

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
    echo "Investor user exists. ID: " . $user->id . "\n";
    // Ensure role_type is set
    if ($user->role_type !== 'investor') {
        $user->role_type = 'investor';
        $user->save();
        echo "Updated role_type to investor.\n";
    }
}

// Ensure at least one fund exists
$fund = Fund::first();
if (!$fund) {
    echo "Creating a test fund...\n";
    $fund = Fund::create([
        'name' => 'Growth Fund I',
        'description' => 'High growth potential fund',
        'status' => 'open',
        'start_date' => now(),
        'min_investment' => 5000,
        'management_fee_percentage' => 2.0,
        'target_return_percentage' => 15.0,
        'price_per_share' => 1000,
        'total_shares' => 1000,
        'available_shares' => 1000,
        'current_nav' => 0,
        'total_assets' => 0,
    ]);
    echo "Fund created with ID: " . $fund->id . "\n";
} else {
    echo "Fund exists with ID: " . $fund->id . "\n";
}

// Ensure the investor has an investment in this fund for testing
$investment = FundInvestment::where('user_id', $user->id)
    ->where('fund_id', $fund->id)
    ->first();

if (!$investment) {
    echo "Creating fund investment for user...\n";
    $shares = 5;
    $amount = 5000;
    
    $investment = FundInvestment::create([
        'user_id' => $user->id,
        'fund_id' => $fund->id,
        'shares' => $shares,
        'amount' => $amount,
        'price_per_share' => $fund->price_per_share,
        'purchase_date' => now(),
        'status' => 'active',
    ]);
    
    // Create transaction record
    Transaction::create([
        'user_id' => $user->id,
        'type' => 'investment',
        'amount' => $amount,
        'fund_id' => $fund->id,
        'description' => "Investment in {$fund->name}",
        'status' => 'completed',
        'reference_number' => 'FUND-INV-' . str_pad($investment->id, 8, '0', STR_PAD_LEFT),
    ]);
    
    echo "Fund investment created.\n";
} else {
    echo "Fund investment exists.\n";
}
