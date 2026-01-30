<?php

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';

function login($email, $password) {
    global $baseUrl;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/auth/login");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['email' => $email, 'password' => $password]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function adminLogin($email, $password) {
    global $baseUrl;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/auth/admin-login");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['email' => $email, 'password' => $password]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function request($method, $endpoint, $token, $data = []) {
    global $baseUrl;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl$endpoint");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if (!empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// 1. Login as Admin to setup data (if needed) or we assume existing users.
// Let's assume we have 'investor@example.com' (Seller) and 'investor2@example.com' (Buyer)
// If not, we might fail. For now, let's try to use existing users or create them via DB if I could (but I can't run php code directly against DB easily here without a script).
// Let's assume 'admin@example.com' exists.

echo "Logging in as Admin...\n";
$adminAuth = adminLogin('admin@example.com', 'password');
$adminToken = $adminAuth['data']['token'] ?? null;

if (!$adminToken) {
    echo "Admin login failed.\n";
    // Try to register/login investor directly?
} else {
    echo "Admin logged in.\n";
}

// 2. Login as Seller (investor@example.com)
echo "Logging in as Seller (investor@example.com)...\n";
$sellerAuth = login('investor@example.com', 'password');
$sellerToken = $sellerAuth['data']['token'] ?? null;

if (!$sellerToken) {
    echo "Seller login failed. Using admin to create/ensure property and investment.\n";
    // Maybe register?
    // For this test, I'll assume the environment has these users. 
    // If not, I'll need to create a seeder or manual SQL.
    // Let's try to proceed.
}

// 3. Login as Buyer (investor2@example.com)
echo "Logging in as Buyer (investor2@example.com)...\n";
$buyerAuth = login('investor2@example.com', 'password');
$buyerToken = $buyerAuth['data']['token'] ?? null;

if (!$sellerToken || !$buyerToken) {
    die("Need both seller and buyer accounts.\n");
}

// 4. Ensure Seller has an investment
// We need a property ID. Let's list properties.
$properties = request('GET', '/investor/properties', $sellerToken);
$propertyId = $properties['data'][0]['id'] ?? 1; // Default to 1 if empty list but usually exists

echo "Using Property ID: $propertyId\n";

// Check Seller's investment
$investments = request('GET', '/investor/investments', $sellerToken);
// This endpoint returns summary. We might need to check DB or just try to list.
// Or we can "Invest" first to ensure we have shares.

echo "Seller investing in property $propertyId to ensure shares...\n";
// POST /properties/{id}/invest is for properties.
// Check InvestorPropertyController invest method signature.
// It likely expects 'amount' and 'shares' (or calculates shares).
// Let's try to invest $1000.
$investResponse = request('POST', "/investor/properties/$propertyId/invest", $sellerToken, [
    'amount' => 1000,
    'shares' => 10 // Assuming $100 per share
]);
print_r($investResponse);

// 5. Seller lists shares
echo "Seller listing 5 shares...\n";
$listResponse = request('POST', '/investor/shares/list', $sellerToken, [
    'property_id' => $propertyId,
    'shares' => 5,
    'price_per_share' => 110, // Selling at premium
    'notes' => 'Great investment!'
]);
print_r($listResponse);

$listingId = $listResponse['data']['id'] ?? null;

if (!$listingId) {
    die("Failed to create listing.\n");
}

// 6. Buyer views available shares
echo "Buyer viewing available shares...\n";
$available = request('GET', '/investor/shares/available', $buyerToken);
// print_r($available);
// Verify our listing is there
$found = false;
foreach ($available['data'] as $listing) {
    if ($listing['id'] == $listingId) {
        $found = true;
        break;
    }
}
if ($found) {
    echo "Listing $listingId found in marketplace.\n";
} else {
    echo "Listing $listingId NOT found in marketplace.\n";
}

// 7. Buyer buys shares
echo "Buyer buying listing $listingId...\n";
$buyResponse = request('POST', "/investor/shares/buy/$listingId", $buyerToken);
print_r($buyResponse);

if (($buyResponse['success'] ?? false) === true) {
    echo "Purchase successful!\n";
} else {
    echo "Purchase failed.\n";
}

// 8. Verify listing is gone/sold
$availableAfter = request('GET', '/investor/shares/available', $buyerToken);
$foundAfter = false;
foreach ($availableAfter['data'] as $listing) {
    if ($listing['id'] == $listingId) {
        $foundAfter = true;
        break;
    }
}

if (!$foundAfter) {
    echo "Listing correctly removed from available list.\n";
} else {
    echo "Listing still visible (Error).\n";
}
