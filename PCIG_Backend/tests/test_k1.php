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

// 2. Generate K1
echo "2. Generating K1 Forms...\n";
$response = $client->post('admin/k1/generate', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'fund_id' => 1,
        'tax_year' => 2024
    ]
]);
$k1 = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "K1 ID: " . ($k1['data']['id'] ?? 'N/A') . "\n\n";
$k1Id = $k1['data']['id'] ?? null;

// 3. List K1 Forms
echo "3. Listing K1 Forms...\n";
$response = $client->get('admin/k1/forms', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$forms = json_decode($response->getBody(), true);
echo "Forms Count: " . count($forms['data']) . "\n\n";

// 4. Publish K1
if ($k1Id) {
    echo "4. Publishing K1 Forms...\n";
    $response = $client->post('admin/k1/publish', [
        'headers' => ['Authorization' => 'Bearer ' . $token],
        'json' => [
            'ids' => [$k1Id]
        ]
    ]);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Response: " . $response->getBody() . "\n";
}
