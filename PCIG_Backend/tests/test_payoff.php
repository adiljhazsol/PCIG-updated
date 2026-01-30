<?php

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';

function request($method, $url, $token = null, $data = null) {
    global $baseUrl;
    $ch = curl_init($baseUrl . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    if ($data) {
        $jsonData = json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
        $headers[] = 'Content-Type: application/json';
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'body' => json_decode($response, true)];
}

// 1. Login as Admin
echo "1. Logging in as Admin...\n";
$login = request('POST', '/auth/admin-login', null, [
    'email' => 'admin@pcig.com',
    'password' => 'password'
]);

if ($login['code'] !== 200) {
    echo "Login failed.\n";
    exit;
}

$token = $login['body']['data']['token'];
echo "Login successful.\n\n";

// 2. Submit Payoff Request
echo "2. Submitting Payoff Request...\n";
$propertyId = 1; // Assuming property 1 exists from previous tests
$request = request('POST', '/admin/payoff/request', $token, [
    'property_id' => $propertyId,
    'requester_name' => 'John Doe',
    'requester_email' => 'john@example.com',
    'requester_phone' => '555-0199'
]);

echo "Response Code: " . $request['code'] . "\n";
print_r($request['body']);
echo "\n";
$requestId = $request['body']['data']['id'] ?? null;

if ($requestId) {
    // 3. Admin Updates Request (Calculate/Approve)
    echo "3. Updating Request (Admin Action)...\n";
    $update = request('PUT', "/admin/payoff/request/{$requestId}", $token, [
        'status' => 'approved',
        'amount' => 150000.00
    ]);
    
    echo "Response Code: " . $update['code'] . "\n";
    print_r($update['body']);
    echo "\n";
}

// 4. List All Requests
echo "4. Listing All Requests...\n";
$list = request('GET', '/admin/payoff/requests', $token);
echo "Owner Requests: " . count($list['body']['data']['owner_requests']) . "\n";
echo "Lawyer Requests: " . count($list['body']['data']['lawyer_requests']) . "\n";
