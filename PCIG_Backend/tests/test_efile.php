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

// 2. Submit Cancellation
echo "2. Submitting E-File Cancellation...\n";
$response = $client->post('admin/efile/cancel', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'property_id' => 1,
        'filing_id' => 'FILE-12345',
        'reason' => 'Incorrect filing amount'
    ]
]);
$cancel = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "ID: " . ($cancel['data']['id'] ?? 'N/A') . "\n";
echo "Cancellation Status: " . ($cancel['data']['status'] ?? 'N/A') . "\n\n";

// 3. List Cancellations
echo "3. Listing Cancellations...\n";
$response = $client->get('admin/efile/cancellations', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$list = json_decode($response->getBody(), true);
echo "Count: " . count($list['data']) . "\n";
