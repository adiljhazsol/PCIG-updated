<?php

require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client([
    'base_uri' => 'http://127.0.0.1:8000/api/',
    'http_errors' => false
]);

// 1. Login as Admin
echo "1. Logging in as Admin...\n";
$response = $client->post('auth/admin-login', [
    'json' => [
        'email' => 'admin@pcig.com',
        'password' => 'password'
    ]
]);
$login = json_decode($response->getBody(), true);
if (!isset($login['data']['token'])) {
    echo "Login Failed: " . $response->getBody() . "\n";
    exit;
}
$token = $login['data']['token'];
echo "Token: " . substr($token, 0, 20) . "...\n\n";

// 2. Calculate Interest
echo "2. Calculating Interest...\n";
$response = $client->post('admin/interest/calculate', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'property_id' => 1,
        'period_start' => '2025-01-01',
        'period_end' => '2025-01-31',
        'principal_amount' => 100000,
        'interest_rate' => 10 // 10%
    ]
]);
$calculation = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Calculated Amount: " . ($calculation['data']['calculated_amount'] ?? 'N/A') . "\n\n";
$calcId = $calculation['data']['id'] ?? null;

// 3. List Pending Interest
echo "3. Listing Pending Interest...\n";
$response = $client->get('admin/interest/pending', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$pending = json_decode($response->getBody(), true);
echo "Pending Count: " . count($pending['data']) . "\n\n";

// 4. Post Interest
if ($calcId) {
    echo "4. Posting Interest...\n";
    $response = $client->post('admin/interest/post', [
        'headers' => ['Authorization' => 'Bearer ' . $token],
        'json' => [
            'ids' => [$calcId]
        ]
    ]);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Response: " . $response->getBody() . "\n\n";
}

// 5. Verify History
echo "5. Verifying History...\n";
$response = $client->get('admin/interest/history', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$history = json_decode($response->getBody(), true);
echo "History Count: " . count($history['data']) . "\n";
