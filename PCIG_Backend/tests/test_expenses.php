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

// 2. Record Expense
echo "2. Recording Expense...\n";
$response = $client->post('admin/expenses', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'property_id' => 1,
        'amount' => 450.00,
        'date' => date('Y-m-d'),
        'description' => 'Emergency plumbing repair',
        'category' => 'Maintenance',
        'allocation_method' => 'ownership_percentage'
    ]
]);
$expense = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Expense ID: " . ($expense['data']['id'] ?? 'N/A') . "\n";
echo "Allocations: " . count($expense['data']['allocations'] ?? []) . "\n\n";

// 3. List Expenses
echo "3. Listing Expenses...\n";
$response = $client->get('admin/expenses', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$list = json_decode($response->getBody(), true);
echo "Expenses Count: " . count($list['data']) . "\n";
