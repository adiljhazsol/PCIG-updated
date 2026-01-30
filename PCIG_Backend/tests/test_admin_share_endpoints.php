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

echo "Testing Admin Share Endpoints...\n\n";

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

// 2. Test Get Share Listings
echo "\n2. Testing Get Share Listings...\n";
$response = makeRequest('GET', "$baseUrl/admin/shares/listings", [], $adminToken);

if ($response['code'] === 200) {
    $count = count($response['body']['data']);
    printResult("Get Share Listings", true, "Found $count listings");
    
    // Check if seller_id filter works (dummy check, just making sure param doesn't crash)
    $response = makeRequest('GET', "$baseUrl/admin/shares/listings?seller_id=1", [], $adminToken);
    if ($response['code'] === 200) {
        printResult("Get Share Listings with seller_id filter", true);
    } else {
        printResult("Get Share Listings with seller_id filter", false, "Code: {$response['code']}");
    }

} else {
    printResult("Get Share Listings", false, "Code: {$response['code']}");
}

// 3. Test Get Share Transactions
echo "\n3. Testing Get Share Transactions...\n";
$response = makeRequest('GET', "$baseUrl/admin/shares/transactions", [], $adminToken);

if ($response['code'] === 200) {
    $count = count($response['body']['data']);
    printResult("Get Share Transactions", true, "Found $count transactions");

    // Check filters
    $response = makeRequest('GET', "$baseUrl/admin/shares/transactions?buyer_id=1", [], $adminToken);
    if ($response['code'] === 200) {
        printResult("Get Share Transactions with buyer_id filter", true);
    } else {
        printResult("Get Share Transactions with buyer_id filter", false, "Code: {$response['code']}");
    }

    $response = makeRequest('GET', "$baseUrl/admin/shares/transactions?seller_id=1", [], $adminToken);
    if ($response['code'] === 200) {
        printResult("Get Share Transactions with seller_id filter", true);
    } else {
        printResult("Get Share Transactions with seller_id filter", false, "Code: {$response['code']}");
    }

} else {
    printResult("Get Share Transactions", false, "Code: {$response['code']}");
}

echo "\nAdmin Share Endpoints Tests Completed.\n";
