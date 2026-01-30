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

// 2. File Tax Appeal
echo "2. Filing Tax Appeal...\n";
$propertyId = 1; 
$appeal = request('POST', '/admin/tax-appeals', $token, [
    'property_id' => $propertyId,
    'filed_date' => date('Y-m-d'),
    'current_assessment' => 200000.00,
    'proposed_assessment' => 150000.00,
    'notes' => 'Assessment is too high compared to comps.'
]);

echo "Response Code: " . $appeal['code'] . "\n";
print_r($appeal['body']);
echo "\n";
$appealId = $appeal['body']['data']['id'] ?? null;

if ($appealId) {
    // 3. Update Appeal Status (Won)
    echo "3. Updating Appeal Status (Won)...\n";
    $update = request('PUT', "/admin/tax-appeals/{$appealId}", $token, [
        'status' => 'won',
        'outcome' => 'Reduced assessment to $160,000',
        'savings' => 1200.00 // Tax savings
    ]);
    
    echo "Response Code: " . $update['code'] . "\n";
    print_r($update['body']);
    echo "\n";
}

// 4. List Appeals
echo "4. Listing Tax Appeals...\n";
$list = request('GET', '/admin/tax-appeals', $token);
echo "Total Appeals: " . $list['body']['data']['total'] . "\n";
