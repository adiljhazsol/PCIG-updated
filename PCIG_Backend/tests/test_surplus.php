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

// 2. Identify Surplus Fund
echo "2. Identifying Surplus Fund...\n";
$response = $client->post('admin/surplus-funds', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'property_id' => 1,
        'amount' => 5000.00,
        'notes' => 'Potential surplus from tax sale'
    ]
]);
$fund = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Fund ID: " . ($fund['data']['id'] ?? 'N/A') . "\n";
$fundId = $fund['data']['id'] ?? null;

// 3. File Claim
if ($fundId) {
    echo "\n3. Filing Claim...\n";
    $response = $client->post("admin/surplus-funds/{$fundId}/claim", [
        'headers' => ['Authorization' => 'Bearer ' . $token],
        'json' => [
            'claim_filed_date' => date('Y-m-d'),
            'notes' => 'Claim paperwork submitted to county'
        ]
    ]);
    echo "Status: " . $response->getStatusCode() . "\n";
    $updated = json_decode($response->getBody(), true);
    echo "New Status: " . ($updated['data']['status'] ?? 'N/A') . "\n";
}

// 4. List Surplus Funds
echo "\n4. Listing Surplus Funds...\n";
$response = $client->get('admin/surplus-funds', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$list = json_decode($response->getBody(), true);
echo "Funds Count: " . count($list['data']) . "\n";
