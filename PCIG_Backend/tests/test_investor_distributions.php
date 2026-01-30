<?php

require 'vendor/autoload.php';

// Configuration
$baseUrl = 'http://localhost:8000/api';
$timestamp = time();
$investorEmail = "investor_{$timestamp}@test.com";
$investorPassword = 'password';

// 1. Register a new investor
echo "Registering new investor: {$investorEmail}...\n";
$ch = curl_init("{$baseUrl}/auth/register");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'first_name' => 'Test',
    'last_name' => 'Investor',
    'email' => $investorEmail,
    'password' => $investorPassword,
    'password_confirmation' => $investorPassword,
    'role' => 'investor'
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Accept: application/json"]);
$response = curl_exec($ch);
$registerData = json_decode($response, true);
$investorToken = $registerData['data']['token'] ?? null;
$investorId = $registerData['data']['user']['id'] ?? null;

if (!$investorToken || !$investorId) {
    die("Investor registration failed. Response: " . $response . "\n");
}
echo "Investor registered successfully. ID: {$investorId}\n";

// 2. Login as admin
echo "Logging in as admin...\n";
$ch = curl_init("{$baseUrl}/auth/admin-login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'email' => 'admin@pcig.com',
    'password' => 'password',
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Accept: application/json"]);
$response = curl_exec($ch);
$loginData = json_decode($response, true);
$adminToken = $loginData['data']['token'] ?? null;

if (!$adminToken) {
    die("Admin login failed. Response: " . $response . "\n");
}
echo "Admin logged in successfully.\n";

// 3. Create a distribution for the investor (as Admin)
echo "Creating a distribution for the investor...\n";
$amount = 123.45;
$description = "Test Distribution {$timestamp}";

$ch = curl_init("{$baseUrl}/admin/distributions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'user_id' => $investorId,
    'amount' => $amount,
    'distribution_date' => date('Y-m-d'),
    'description' => $description,
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

// 4. Get Investor Distributions (as Investor)
echo "Fetching investor distributions...\n";
$ch = curl_init("{$baseUrl}/investor/distributions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$investorToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$distributionsData = json_decode($response, true);

if (!($distributionsData['success'] ?? false)) {
    die("Failed to fetch distributions. Response: " . $response . "\n");
}

// 5. Verify the distribution is present
$found = false;
foreach ($distributionsData['data'] as $dist) {
    if ($dist['id'] == $distributionId) {
        $found = true;
        if ($dist['amount'] == $amount && $dist['description'] == $description) {
            echo "Distribution verification successful: ID, Amount, and Description match.\n";
        } else {
            echo "Distribution found but data mismatch. Expected Amount: {$amount}, Desc: {$description}. Got: {$dist['amount']}, {$dist['description']}\n";
        }
        break;
    }
}

if ($found) {
    echo "Test PASSED: Investor can view their distributions.\n";
} else {
    echo "Test FAILED: Created distribution not found in investor's list.\n";
    echo "List Response: " . json_encode($distributionsData, JSON_PRETTY_PRINT) . "\n";
}

// 6. Test Filtering
echo "Testing filtering by status=pending...\n";
$ch = curl_init("{$baseUrl}/investor/distributions?status=pending");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$investorToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$filteredData = json_decode($response, true);

if (count($filteredData['data'] ?? []) > 0) {
    echo "Filtering test PASSED: Found pending distributions.\n";
} else {
    echo "Filtering test FAILED: No pending distributions found.\n";
}
