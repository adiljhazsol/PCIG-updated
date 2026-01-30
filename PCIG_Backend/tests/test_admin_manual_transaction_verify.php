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

// 2. Test Manual Transaction Creation
echo "\n2. Testing Manual Transaction Creation...\n";
$transactionData = [
    'user_id' => 1,
    'type' => 'deposit',
    'amount' => 1000,
    'description' => 'Manual deposit test'
];

$response = makeRequest('POST', "$baseUrl/admin/transactions", $transactionData, $adminToken);

if ($response['code'] === 201) {
    printResult("Create Transaction", true, "Created transaction with ID: " . $response['body']['data']['id']);
} else {
    printResult("Create Transaction", false, "Code: {$response['code']}, Message: " . json_encode($response['body']));
}

echo "\nAdmin Manual Transaction Test Completed.\n";
