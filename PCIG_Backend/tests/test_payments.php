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
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        // Use JSON for more complex data structures if needed, but http_build_query is fine for simple forms
        // For array data like payment_ids, we might need to use JSON
        if (isset($data['payment_ids'])) {
             $jsonData = json_encode($data);
             curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
             $headers[] = 'Content-Type: application/json';
        }
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
    echo "Login failed: " . print_r($login['body'], true) . "\n";
    exit;
}

$token = $login['body']['data']['token'];
echo "Login successful. Token acquired.\n\n";

// 2. Create Pending Payments (Simulating distributions)
echo "2. Creating Pending Payments...\n";
$paymentIds = [];
for ($i = 1; $i <= 3; $i++) {
    $res = request('POST', '/admin/payments', $token, [
        'user_id' => 1, // Assuming user ID 1 exists
        'amount' => 100.50 * $i,
        'type' => 'distribution',
        'status' => 'pending'
    ]);
    
    if ($res['code'] === 201) {
        $paymentIds[] = $res['body']['data']['id'];
        echo "Created Payment ID: " . $res['body']['data']['id'] . "\n";
    } else {
        echo "Failed to create payment: " . print_r($res['body'], true) . "\n";
    }
}
echo "\n";

// 3. List Pending Payments
echo "3. Listing Pending Payments...\n";
$pending = request('GET', '/admin/payments/pending?type=distribution', $token);
echo "Pending Count: " . $pending['body']['summary']['count'] . "\n";
echo "Total Amount: " . $pending['body']['summary']['total_amount'] . "\n\n";

// 4. Process Batch
if (!empty($paymentIds)) {
    echo "4. Processing Batch for IDs: " . implode(', ', $paymentIds) . "...\n";
    $process = request('POST', '/admin/payments/process', $token, [
        'payment_ids' => $paymentIds,
        'payment_method' => 'ach'
    ]);
    
    echo "Process Response Code: " . $process['code'] . "\n";
    if ($process['code'] === 200) {
        echo "Batch Processed. Batch ID: " . $process['body']['data']['id'] . "\n";
    } else {
        print_r($process['body']);
    }
}
echo "\n";

// 5. Verify Payments Status
echo "5. Verifying Payment Status...\n";
$list = request('GET', '/admin/payments', $token);
foreach ($list['body']['data']['data'] as $p) {
    if (in_array($p['id'], $paymentIds)) {
        echo "Payment ID {$p['id']}: Status = {$p['status']}, Batch ID = {$p['batch_id']}\n";
    }
}
