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

echo "Testing Admin Manual Transaction Creation...\n\n";

// 1. Login as Admin
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

// 2. Create User for Transaction
echo "\n2. Creating Investor for Transaction...\n";
$investorData = [
    'first_name' => 'Trans',
    'last_name' => 'Actor',
    'email' => 'transactor' . time() . '@test.com',
    'password' => 'password',
    'password_confirmation' => 'password',
    'role' => 'investor'
];

$response = makeRequest('POST', "$baseUrl/auth/register", $investorData);
if ($response['code'] === 201) {
    $investorId = $response['body']['data']['user']['id'];
    printResult("Create Investor", true, "ID: $investorId");
} else {
    printResult("Create Investor", false, json_encode($response['body']));
    exit(1);
}

// 3. Test Manual Transaction Creation
echo "\n3. Testing Manual Transaction Creation...\n";
$transactionData = [
    'user_id' => $investorId,
    'type' => 'deposit',
    'amount' => 1000.50,
    'description' => 'Manual deposit via API test',
    'status' => 'completed'
];

$response = makeRequest('POST', "$baseUrl/admin/transactions", $transactionData, $adminToken);

if ($response['code'] === 201) {
    $txn = $response['body']['data'];
    $valid = $txn['amount'] == 1000.50 && 
             $txn['type'] === 'deposit' && 
             $txn['user']['id'] == $investorId &&
             $txn['status'] === 'completed';
    
    printResult("Create Manual Transaction", $valid, "TXN Ref: " . ($txn['reference_number'] ?? 'N/A'));
} else {
    printResult("Create Manual Transaction", false, "Code: {$response['code']}, Body: " . json_encode($response['body']));
}

echo "\nAdmin Manual Transaction Tests Completed.\n";
