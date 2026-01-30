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

// 2. Calculate Depreciation
echo "2. Calculating Depreciation...\n";
$response = $client->post('admin/depreciation/calculate', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'property_id' => 1,
        'tax_year' => 2024,
        'asset_basis' => 275000,
        'useful_life_years' => 27, // Residential rental property 27.5 years approx
        'method' => 'straight_line'
    ]
]);
$depreciation = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Depreciation Amount: " . ($depreciation['data']['depreciation_amount'] ?? 'N/A') . "\n\n";

// 3. List Depreciation History
echo "3. Listing Depreciation History...\n";
$response = $client->get('admin/depreciation/history', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$history = json_decode($response->getBody(), true);
echo "History Count: " . count($history['data']) . "\n";
