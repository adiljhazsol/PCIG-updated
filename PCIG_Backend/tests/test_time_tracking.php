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

// 2. Log Time Entry
echo "2. Logging Time Entry...\n";
$propertyId = 1; 
$entry = request('POST', '/admin/time-tracking', $token, [
    'property_id' => $propertyId,
    'date' => date('Y-m-d'),
    'hours' => 2.5,
    'description' => 'Site inspection and repair coordination',
    'billable' => true
]);

echo "Response Code: " . $entry['code'] . "\n";
print_r($entry['body']);
echo "\n";
$entryId = $entry['body']['data']['id'] ?? null;

if ($entryId) {
    // 3. Update Entry
    echo "3. Updating Time Entry...\n";
    $update = request('PUT', "/admin/time-tracking/{$entryId}", $token, [
        'hours' => 3.0,
        'description' => 'Site inspection, repair coordination, and vendor meeting'
    ]);
    
    echo "Response Code: " . $update['code'] . "\n";
    print_r($update['body']);
    echo "\n";
}

// 4. List Entries
echo "4. Listing Time Entries...\n";
$list = request('GET', '/admin/time-tracking', $token);
echo "Total Entries: " . $list['body']['data']['total'] . "\n";
