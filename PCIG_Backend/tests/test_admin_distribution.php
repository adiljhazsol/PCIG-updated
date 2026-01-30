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
$adminUserId = $loginData['data']['user']['id'] ?? null;

if (!$adminToken) {
    die("Admin login failed. Response: " . $response . "\n");
}
echo "Admin logged in successfully.\n";

// Get a user for distribution (using admin user for simplicity if no other user)
// In a real scenario, we might want to list investors and pick one.
// Let's list investors first.
echo "Fetching investors...\n";
$ch = curl_init("{$baseUrl}/admin/investors");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$investorData = json_decode($response, true);
$investorId = $investorData['data'][0]['id'] ?? $adminUserId; // Fallback to admin ID if no investors found

if (!$investorId) {
    die("No user found for distribution test.\n");
}
echo "Using User ID: {$investorId} for distribution.\n";

// Create a distribution
echo "Creating a distribution...\n";
$ch = curl_init("{$baseUrl}/admin/distributions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'user_id' => $investorId,
    'amount' => 500.00,
    'distribution_date' => date('Y-m-d'),
    'description' => 'Test Distribution ' . time(),
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$distributionData = json_decode($response, true);
$distributionId = $distributionData['data']['id'] ?? null;

if (!$distributionId) {
    die("Failed to create distribution. Response: " . $response . "\n");
}
echo "Distribution created successfully. ID: {$distributionId}\n";

// List distributions
echo "Listing distributions...\n";
$ch = curl_init("{$baseUrl}/admin/distributions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$listData = json_decode($response, true);

if (($listData['success'] ?? false) === true) {
    echo "Distributions listed successfully. Count: " . count($listData['data']) . "\n";
} else {
    echo "Failed to list distributions. Response: " . $response . "\n";
}

// Process distribution
echo "Processing distribution...\n";
$ch = curl_init("{$baseUrl}/admin/distributions/{$distributionId}/process");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$processData = json_decode($response, true);

if (($processData['success'] ?? false) === true && ($processData['data']['status'] ?? '') === 'processed') {
    echo "Distribution processed successfully.\n";
} else {
    echo "Failed to process distribution. Response: " . $response . "\n";
}

echo "Admin Distribution Test Completed.\n";
