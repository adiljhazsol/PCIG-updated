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

echo "--- TEST AUCTION MODULE ---\n";

// 1. Login as Admin
echo "Logging in as Admin...\n";
$auth = login('admin@example.com', 'password');
$token = $auth['data']['token'] ?? null;

if (!$token) {
    echo "Admin login failed. Response:\n";
    print_r($auth);
    die();
}

// 2. Find a Property
echo "Finding a property...\n";
$allProperties = request('GET', '/admin/properties', $token);
if ($allProperties['code'] != 200) die("Failed to list properties.\n");

$propertyId = $allProperties['body']['data'][0]['id'] ?? null;
if (!$propertyId) die("No properties found.\n");

echo "Using Property ID: $propertyId\n";

// 3. Schedule Auction
echo "Scheduling Auction...\n";
$schedule = request('POST', "/admin/auction/schedule", $token, [
    'property_id' => $propertyId,
    'auction_date' => '2026-05-15 10:00:00',
    'location' => 'County Courthouse',
    'starting_bid' => 50000.00,
    'notes' => 'Test auction scheduling'
]);
echo "Schedule Response Code: " . $schedule['code'] . "\n";

$auctionId = null;
if ($schedule['code'] == 201 || $schedule['code'] == 200) {
    echo "Scheduling successful.\n";
    print_r($schedule['body']);
    $auctionId = $schedule['body']['data']['id'];

    // Check if property moved to auction stage
    $propCheck = request('GET', "/admin/properties/$propertyId", $token);
    echo "Property Workflow Stage: " . ($propCheck['body']['data']['workflow_stage'] ?? 'unknown') . "\n";

} else {
    echo "Scheduling failed. Raw response:\n";
    echo $schedule['raw'] . "\n";
    die();
}

// 4. Update Auction
echo "Updating Auction (ID: $auctionId)...\n";
$update = request('PUT', "/admin/auction/$auctionId/update", $token, [
    'notes' => 'Updated auction notes',
    'starting_bid' => 55000.00
]);
echo "Update Response Code: " . $update['code'] . "\n";
print_r($update['body']);

// 5. Complete Auction (Sold)
echo "Completing Auction (Sold)...\n";
$complete = request('POST', "/admin/auction/$auctionId/complete", $token, [
    'status' => 'completed',
    'winning_bid' => 60000.00,
    'winner_info' => 'John Doe Investors LLC'
]);
echo "Complete Response Code: " . $complete['code'] . "\n";
print_r($complete['body']);

// Check Property Status (Should be sold)
$propCheck = request('GET', "/admin/properties/$propertyId", $token);
echo "Property Workflow Stage: " . ($propCheck['body']['data']['workflow_stage'] ?? 'unknown') . "\n";
echo "Property Status: " . ($propCheck['body']['data']['status'] ?? 'unknown') . "\n";

// 6. List Auction Properties
echo "Listing Auction Properties...\n";
// Note: Since we just sold it, it might not be in 'auction' stage anymore, so list might be empty or show others.
// But let's check.
$list = request('GET', '/admin/auction/properties', $token);
echo "Auction Properties Count: " . count($list['body']['data'] ?? []) . "\n";
