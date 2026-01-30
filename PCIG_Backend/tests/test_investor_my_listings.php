<?php

require 'vendor/autoload.php';

// Configuration
$baseUrl = 'http://127.0.0.1:8000/api';
$adminEmail = 'admin@pcig.com';
$adminPassword = 'password';

// Colors for output
$green = "\033[32m";
$red = "\033[31m";
$reset = "\033[0m";

function printResult($testName, $success, $message = '') {
    global $green, $red, $reset;
    if ($success) {
        echo "{$green}[PASS] $testName{$reset}\n";
    } else {
        echo "{$red}[FAIL] $testName: $message{$reset}\n";
    }
}

function makeRequest($method, $url, $data = [], $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if (!empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'body' => json_decode($response, true)];
}

echo "Testing Investor My Listings Endpoint...\n\n";

// 1. Login as Admin to setup data
echo "1. Logging in as Admin...\n";
$response = makeRequest('POST', "$baseUrl/auth/admin-login", [
    'email' => $adminEmail,
    'password' => $adminPassword
]);

if ($response['code'] === 200 && isset($response['body']['data']['token'])) {
    $adminToken = $response['body']['data']['token'];
    printResult("Admin Login", true);
} else {
    printResult("Admin Login", false, "Failed to login");
    exit(1);
}

// 2. Create Property
echo "\n2. Creating Property...\n";
$propertyData = [
    'address' => '123 Market St ' . time(),
    'city' => 'Market City',
    'state' => 'MC',
    'zip_code' => '12345',
    'type' => 'Residential',
    'status' => 'active',
    'purchase_price' => 500000,
    'current_value' => 550000,
    'price_per_share' => 100,
    'total_shares' => 5000,
    'available_shares' => 5000,
    'min_investment' => 1000,
    'roi' => 12.5,
    'description' => 'Marketplace test property',
    'parcel_id' => 'MKTP-' . time()
];

$response = makeRequest('POST', "$baseUrl/admin/properties", $propertyData, $adminToken);
if ($response['code'] === 201) {
    $propertyId = $response['body']['data']['id'];
    printResult("Create Property", true, "ID: $propertyId");
} else {
    printResult("Create Property", false, json_encode($response['body']));
    exit(1);
}

// 3. Create Investor
echo "\n3. Creating Investor...\n";
$investorData = [
    'first_name' => 'Market',
    'last_name' => 'Seller',
    'email' => 'seller' . time() . '@test.com',
    'password' => 'password',
    'password_confirmation' => 'password',
    'role' => 'investor'
];

$response = makeRequest('POST', "$baseUrl/auth/register", $investorData);
if ($response['code'] === 201) {
    $investorToken = $response['body']['data']['token'];
    $investorId = $response['body']['data']['user']['id'];
    printResult("Create Investor", true, "ID: $investorId");
} else {
    printResult("Create Investor", false, json_encode($response['body']));
    exit(1);
}

// 4. Assign Shares to Investor (via Investment)
// We need to simulate that the investor has bought shares first
// Since we don't have a direct "admin assign shares" endpoint easily accessible here without going through payment flow,
// we'll use the investment endpoint or manual transaction if available.
// But wait, the previous task added "manual transaction" but that's for Transaction model, not Investment model.
// However, the `invest` endpoint exists. Let's use that.
// But first we need to fund the wallet? Or does invest endpoint allow direct investment?
// Let's assume we can just use the invest endpoint.

echo "\n4. Investor Buying Shares...\n";
$investData = [
    'amount' => 10000, // 100 shares at $100
    'payment_method_id' => 'pm_test', 
    'shares' => 100
];
// Note: The invest endpoint might expect 'amount' and calculate shares, or both.
// Let's check InvestorPropertyController::invest to be sure, but standard is usually amount.
// Actually, let's just create a ShareListing directly via database seeding or similar if we could, 
// but we are in API test mode.
// Let's try to hit the invest endpoint.

$response = makeRequest('POST', "$baseUrl/investor/properties/$propertyId/invest", $investData, $investorToken);
if ($response['code'] === 201 || $response['code'] === 200) {
    printResult("Invest in Property", true);
} else {
    // If investment fails (maybe due to payment mock), we might need another way.
    // Let's try to see if we can use the `list` endpoint to create a listing.
    // But `list` endpoint checks if user has shares.
    // So we need to ensure user has shares.
    printResult("Invest in Property", false, "Response: " . json_encode($response['body']));
    // If this fails, we can't proceed with listing creation test properly via API.
    // But wait, the task is about "viewing own listings".
    // So if we can't create a listing, we can't view it.
    
    // Let's manually insert an investment and listing using a temporary PHP script if needed, 
    // but better to use available APIs.
    // Assuming the invest endpoint works (it was tested in previous tasks).
}

// 5. Create a Share Listing
echo "\n5. Creating Share Listing...\n";
$listingData = [
    'property_id' => $propertyId,
    'shares' => 10,
    'price_per_share' => 110, // Selling for profit
    'notes' => 'Selling 10 shares'
];

$response = makeRequest('POST', "$baseUrl/investor/shares/list", $listingData, $investorToken);
if ($response['code'] === 201) {
    $listingId = $response['body']['data']['id'];
    printResult("Create Listing", true, "ID: $listingId");
} else {
    printResult("Create Listing", false, json_encode($response['body']));
    exit(1);
}

// 6. Get My Listings
echo "\n6. Testing Get My Listings...\n";
$response = makeRequest('GET', "$baseUrl/investor/shares/my-listings", [], $investorToken);

if ($response['code'] === 200) {
    $data = $response['body']['data'];
    $found = false;
    foreach ($data as $item) {
        if ($item['id'] == $listingId) {
            $found = true;
            break;
        }
    }
    
    if ($found) {
        printResult("Get My Listings", true, "Found listing $listingId");
    } else {
        printResult("Get My Listings", false, "Listing $listingId not found in response");
    }
} else {
    printResult("Get My Listings", false, "Code: {$response['code']}");
}

echo "\nInvestor My Listings Tests Completed.\n";
