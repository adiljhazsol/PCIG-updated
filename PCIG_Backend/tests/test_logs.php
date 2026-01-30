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
$token = $login['data']['token'];
echo "Token obtained.\n\n";

// 2. Create Export Log
echo "2. Creating Export Log...\n";
$response = $client->post('admin/exports-log', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'type' => 'properties_report',
        'file_path' => '/exports/properties_2026_01_24.csv'
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$export = json_decode($response->getBody(), true);
echo "Export ID: " . $export['data']['id'] . "\n\n";

// 3. Create Notice Log
echo "3. Creating Notice Log...\n";
$response = $client->post('admin/notices-log', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'sent_to' => 'investor@example.com',
        'status' => 'sent'
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$notice = json_decode($response->getBody(), true);
echo "Notice ID: " . $notice['data']['id'] . "\n\n";

// 4. List Exports
echo "4. Listing Exports...\n";
$response = $client->get('admin/exports-log', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$exports = json_decode($response->getBody(), true);
echo "Total Exports: " . count($exports['data']['data']) . "\n\n";

// 5. List Notices
echo "5. Listing Notices...\n";
$response = $client->get('admin/notices-log', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$notices = json_decode($response->getBody(), true);
echo "Total Notices: " . count($notices['data']['data']) . "\n";
