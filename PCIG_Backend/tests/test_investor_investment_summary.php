<?php

require 'vendor/autoload.php';

// Configuration
$baseUrl = 'http://127.0.0.1:8000/api';
$investorEmail = 'investor@pcig.com';
$investorPassword = 'password';

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

echo "Testing Investor Investment Summary Endpoint...\n\n";

// 1. Login as Investor
echo "1. Logging in as Investor...\n";
$response = makeRequest('POST', "$baseUrl/auth/login", [
    'email' => $investorEmail,
    'password' => $investorPassword
]);

if ($response['code'] === 200 && isset($response['body']['data']['token'])) {
    $investorToken = $response['body']['data']['token'];
    printResult("Investor Login", true);
} else {
    printResult("Investor Login", false, "Failed to login");
    exit(1);
}

// 2. Get a Property ID (assuming property with ID 1 exists)
$propertyId = 1;

// 3. Test Investment Summary
echo "\n3. Testing Investment Summary for Property $propertyId...\n";
$response = makeRequest('GET', "$baseUrl/investor/properties/$propertyId/investment-summary", [], $investorToken);

if ($response['code'] === 200) {
    $data = $response['body']['data'];
    $hasInvestment = $data['has_investment'] ? "Yes" : "No";
    printResult("Get Investment Summary", true, "Has Investment: $hasInvestment");
    
    if ($data['has_investment']) {
        echo "   - Shares: " . $data['investment']['shares'] . "\n";
        echo "   - Amount: $" . $data['investment']['amount'] . "\n";
        echo "   - Total Return: $" . $data['total_return'] . "\n";
    }
} else {
    printResult("Get Investment Summary", false, "Code: {$response['code']}, Message: " . json_encode($response['body']));
}

echo "\nInvestor Investment Summary Test Completed.\n";
