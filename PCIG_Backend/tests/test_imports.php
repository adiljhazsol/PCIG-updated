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

// 2. Import Data
echo "2. Importing Data (Mock CSV)...\n";
// Create a dummy CSV file
$csvContent = "name,email\nJohn,john@example.com\nJane,jane@example.com";
$csvPath = sys_get_temp_dir() . '/test_import.csv';
file_put_contents($csvPath, $csvContent);

$response = $client->post('admin/import', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'multipart' => [
        [
            'name'     => 'type',
            'contents' => 'investors'
        ],
        [
            'name'     => 'file',
            'contents' => fopen($csvPath, 'r'),
            'filename' => 'test_import.csv'
        ]
    ]
]);
$import = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Import ID: " . ($import['data']['id'] ?? 'N/A') . "\n";
echo "Import Status: " . ($import['data']['status'] ?? 'N/A') . "\n";
echo "Success Count: " . ($import['data']['success_count'] ?? 'N/A') . "\n";
echo "Error Count: " . ($import['data']['error_count'] ?? 'N/A') . "\n\n";

// 3. Get Import History
echo "3. Getting Import History...\n";
$response = $client->get('admin/imports/history', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$history = json_decode($response->getBody(), true);
echo "History Count: " . count($history['data']) . "\n\n";

// 4. Get Import Details
echo "4. Getting Import Details...\n";
$id = $import['data']['id'] ?? 1;
$response = $client->get("admin/imports/{$id}", [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$details = json_decode($response->getBody(), true);
echo "Details ID: " . ($details['data']['id'] ?? 'N/A') . "\n";
echo "Errors Count: " . count($details['data']['errors'] ?? []) . "\n";
