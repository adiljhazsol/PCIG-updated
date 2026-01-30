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

// 2. Generate Notice
echo "2. Generating Notice...\n";
$response = $client->post('admin/notices/generate', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'property_id' => 1,
        'template_id' => 1,
        'recipient_name' => 'John Doe',
        'recipient_address' => '123 Main St, Springfield'
    ]
]);
$notice = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Notice ID: " . ($notice['data']['id'] ?? 'N/A') . "\n";
echo "File Path: " . ($notice['data']['file_path'] ?? 'N/A') . "\n\n";

// 3. List Notices
echo "3. Listing Notices...\n";
$response = $client->get('admin/notices', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$list = json_decode($response->getBody(), true);
echo "Notices Count: " . count($list['data']) . "\n";
