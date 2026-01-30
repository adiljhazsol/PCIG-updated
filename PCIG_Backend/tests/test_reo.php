<?php

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';

function login($email, $password) {
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
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'body' => json_decode($response, true), 'raw' => $response];
}

echo "--- TEST REO DISPOSITION MODULE ---\n";

// 1. Login as Admin
echo "Logging in as Admin...\n";
$auth = login('admin@example.com', 'password');
$token = $auth['data']['token'] ?? null;

if (!$token) {
    echo "Admin login failed. Response:\n";
    print_r($auth);
    die();
}

// 2. Create a new Property for REO testing
echo "Creating a new property...\n";
$create = request('POST', '/admin/properties', $token, [
    'parcel_id' => 'PID-REO-' . rand(1000, 9999),
    'address' => '123 REO Test St ' . rand(1000, 9999),
    'city' => 'Test City',
    'county' => 'Test County',
    'state' => 'TS',
    'zip_code' => '12345',
    'purchase_price' => 100000.00,
    'current_value' => 120000.00,
    'workflow_stage' => 'sheriff' // Start somewhere before REO
]);

$propertyId = $create['body']['data']['id'] ?? null;
if (!$propertyId) {
    echo "Failed to create property.\n";
    print_r($create);
    die();
}
echo "Created Property ID: $propertyId\n";

// 3. List Property for Sale (Moves to REO)
echo "Listing Property for Sale (Move to REO)...\n";
$list = request('POST', "/admin/reo/$propertyId/list", $token, [
    'listed_price' => 150000.00,
    'listing_agent' => 'Agent Smith',
    'listing_date' => date('Y-m-d'),
]);

echo "List Response Code: " . $list['code'] . "\n";
$reoPropertyId = null;
if ($list['code'] == 200) {
    echo "Listing successful.\n";
    $data = $list['body']['data']['reo_property'] ?? $list['body']['data'];
    print_r($data);
    $reoPropertyId = $data['id'] ?? null;
} else {
    echo "Listing failed. Raw:\n" . $list['raw'] . "\n";
    die();
}

if (!$reoPropertyId) {
    echo "Failed to get REO Property ID.\n";
    die();
}
echo "REO Property ID: $reoPropertyId\n";

// Check Property Workflow Stage
$propCheck = request('GET', "/admin/properties/$propertyId", $token);
echo "Property Workflow Stage: " . ($propCheck['body']['data']['workflow_stage'] ?? 'unknown') . "\n";

// 4. Update REO Details
echo "Updating REO Details...\n";
$update = request('PUT', "/admin/reo/$reoPropertyId/update", $token, [
    'notes' => 'Updated REO notes',
    'disposition_strategy' => 'sale'
]);
echo "Update Response Code: " . $update['code'] . "\n";

// 5. Add Offer
echo "Adding Offer...\n";
$offer = request('POST', "/admin/reo/$reoPropertyId/offers", $token, [
    'offer_amount' => 140000.00,
    'buyer_info' => 'Investor LLC',
    'offer_date' => date('Y-m-d'),
    'notes' => 'Initial offer'
]);
echo "Add Offer Response Code: " . $offer['code'] . "\n";
$offerId = $offer['body']['data']['id'] ?? null;
if (!$offerId) {
    echo "Failed to add offer.\n";
    print_r($offer['body']);
    die();
}
echo "Offer ID: $offerId\n";

// 6. Update Offer (Accept)
echo "Accepting Offer...\n";
$accept = request('PUT', "/admin/reo/offers/$offerId", $token, [
    'status' => 'accepted',
    'notes' => 'Accepted offer after review'
]);
echo "Accept Offer Response Code: " . $accept['code'] . "\n";
print_r($accept['body']);

// Check REO Status (Should be offer_accepted)
$propCheck = request('GET', "/admin/properties/$propertyId", $token);
$reoStatus = $propCheck['body']['data']['reo_property']['status'] ?? 'unknown';
echo "REO Status: $reoStatus\n";

// 7. List REO Properties
echo "Listing REO Properties...\n";
$listReo = request('GET', '/admin/reo/properties', $token);
echo "REO Properties Count: " . count($listReo['body']['data'] ?? []) . "\n";
