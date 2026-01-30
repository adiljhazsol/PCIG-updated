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

echo "--- TEST REO LEASED MODULE ---\n";

// 1. Login as Admin
echo "Logging in as Admin...\n";
$auth = login('admin@example.com', 'password');
$token = $auth['data']['token'] ?? null;

if (!$token) {
    echo "Admin login failed. Response:\n";
    print_r($auth);
    die();
}

// 2. Create a new Property for Lease testing
echo "Creating a new property...\n";
$create = request('POST', '/admin/properties', $token, [
    'parcel_id' => 'PID-LEASE-' . rand(1000, 9999),
    'address' => '123 Lease Test St ' . rand(1000, 9999),
    'city' => 'Test City',
    'county' => 'Test County',
    'state' => 'TS',
    'zip_code' => '12345',
    'purchase_price' => 100000.00,
    'current_value' => 120000.00,
    'workflow_stage' => 'reo_disposition' // Start at REO
]);

$propertyId = $create['body']['data']['id'] ?? null;
if (!$propertyId) {
    echo "Failed to create property.\n";
    print_r($create);
    die();
}
echo "Created Property ID: $propertyId\n";

// 3. Create Lease
echo "Creating Lease...\n";
$lease = request('POST', "/admin/reo/$propertyId/lease", $token, [
    'tenant_name' => 'John Doe',
    'monthly_rent' => 1200.00,
    'security_deposit' => 1200.00,
    'lease_start' => date('Y-m-d'),
    'lease_end' => date('Y-m-d', strtotime('+1 year')),
    'notes' => 'Initial lease agreement'
]);

echo "Lease Response Code: " . $lease['code'] . "\n";
if ($lease['code'] == 201) {
    echo "Lease created successfully.\n";
    print_r($lease['body']['data']);
} else {
    echo "Lease creation failed. Raw:\n" . $lease['raw'] . "\n";
    die();
}
$leaseId = $lease['body']['data']['id'];

// Check Property Workflow Stage (Should be reo_leased)
$propCheck = request('GET', "/admin/properties/$propertyId", $token);
echo "Property Workflow Stage: " . ($propCheck['body']['data']['workflow_stage'] ?? 'unknown') . "\n";

// 4. Update Lease
echo "Updating Lease...\n";
$update = request('PUT', "/admin/reo/lease/$leaseId/update", $token, [
    'notes' => 'Updated lease notes',
    'monthly_rent' => 1250.00
]);
echo "Update Response Code: " . $update['code'] . "\n";

// 5. Add Rent Payment
echo "Adding Rent Payment...\n";
$payment = request('POST', "/admin/reo/lease/$leaseId/payment", $token, [
    'amount' => 1250.00,
    'due_date' => date('Y-m-d'),
    'paid_date' => date('Y-m-d'),
    'status' => 'paid',
    'notes' => 'First month rent'
]);
echo "Add Payment Response Code: " . $payment['code'] . "\n";
print_r($payment['body']['data']);

// 6. List Leased Properties
echo "Listing Leased Properties...\n";
$list = request('GET', '/admin/reo/leased', $token);
echo "Leased Properties Count: " . count($list['body']['data'] ?? []) . "\n";
