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

// 2. Get Report Types
echo "2. Getting Report Types...\n";
$response = $client->get('admin/reports/types', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$types = json_decode($response->getBody(), true);
echo "Types: " . implode(', ', array_keys($types['data'])) . "\n\n";

// 3. Generate Report
echo "3. Generating Report...\n";
$response = $client->post('admin/reports/generate', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'type' => 'financial_summary',
        'parameters' => ['year' => 2024]
    ]
]);
$report = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Report ID: " . ($report['data']['id'] ?? 'N/A') . "\n";
echo "File Path: " . ($report['data']['file_path'] ?? 'N/A') . "\n\n";

// 4. Report History
echo "4. Getting Report History...\n";
$response = $client->get('admin/reports/history', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$history = json_decode($response->getBody(), true);
echo "History Count: " . count($history['data']) . "\n";
