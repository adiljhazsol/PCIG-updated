<?php

require 'vendor/autoload.php';

// Configuration
$baseUrl = 'http://localhost:8000/api';

// Admin Login
echo "Logging in as admin...\n";
$ch = curl_init("{$baseUrl}/auth/admin-login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'email' => 'admin@pcig.com',
    'password' => 'password',
]);
$response = curl_exec($ch);
$loginData = json_decode($response, true);
$adminToken = $loginData['data']['token'] ?? null;

if (!$adminToken) {
    die("Admin login failed. Response: " . $response . "\n");
}
echo "Admin logged in successfully.\n";

// Create a test property
echo "Creating a test property...\n";
$ch = curl_init("{$baseUrl}/admin/properties");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'parcel_id' => 'TEST-PROP-' . time(),
    'address' => '123 Test St',
    'city' => 'Test City',
    'state' => 'TS',
    'zip_code' => '12345',
    'status' => 'active',
    'purchase_price' => 100000,
    'current_value' => 120000,
    'price_per_share' => 100,
    'roi' => 5.5,
    'total_shares' => 1000,
    'available_shares' => 1000,
    'purchase_date' => date('Y-m-d'),
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$propertyData = json_decode($response, true);
$propertyId = $propertyData['data']['id'] ?? null;

if (!$propertyId) {
    die("Failed to create property. Response: " . $response . "\n");
}
echo "Property created successfully. ID: {$propertyId}\n";

// Create a test fund
echo "Creating a test fund...\n";
$ch = curl_init("{$baseUrl}/admin/funds");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'name' => 'Test Fund ' . time(),
    'slug' => 'test-fund-' . time(),
    'description' => 'Test Fund Description',
    'status' => 'open',
    'total_assets' => 1000000,
    'min_investment' => 1000,
    'current_nav' => 100,
    'total_shares' => 10000,
    'available_shares' => 10000,
    'price_per_share' => 100,
    'launch_date' => date('Y-m-d'),
    'close_date' => date('Y-m-d', strtotime('+1 year')),
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$fundData = json_decode($response, true);
$fundId = $fundData['data']['id'] ?? null;

if (!$fundId) {
    die("Failed to create fund. Response: " . $response . "\n");
}
echo "Fund created successfully. ID: {$fundId}\n";

// Assign property to fund
echo "Assigning property to fund...\n";
$ch = curl_init("{$baseUrl}/admin/funds/assign-property");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'fund_id' => $fundId,
    'property_id' => $propertyId,
    'allocation_percentage' => 25,
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$assignData = json_decode($response, true);

if (($assignData['success'] ?? false) === true) {
    echo "Property assigned to fund successfully.\n";
    print_r($assignData['data']);
} else {
    echo "Failed to assign property to fund. Response: " . $response . "\n";
    exit(1);
}

// Test Duplicate Assignment
echo "Testing duplicate assignment...\n";
$ch = curl_init("{$baseUrl}/admin/funds/assign-property");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'fund_id' => $fundId,
    'property_id' => $propertyId,
    'allocation_percentage' => 25,
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$duplicateData = json_decode($response, true);

if (curl_getinfo($ch, CURLINFO_HTTP_CODE) === 400 && ($duplicateData['success'] ?? true) === false) {
    echo "Duplicate assignment prevented successfully.\n";
} else {
    echo "Duplicate assignment test failed. Response: " . $response . "\n";
}

echo "Assign Property To Fund Test Completed.\n";
