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

// 2. Create Template
echo "2. Creating Template...\n";
$response = $client->post('admin/templates', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'name' => 'Standard Eviction Notice',
        'type' => 'notice',
        'content' => 'Dear {{name}}, You are hereby evicted.',
        'variables' => ['name', 'date']
    ]
]);
$template = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "ID: " . ($template['data']['id'] ?? 'N/A') . "\n";
echo "Name: " . ($template['data']['name'] ?? 'N/A') . "\n\n";
$id = $template['data']['id'] ?? 1;

// 3. List Templates
echo "3. Listing Templates...\n";
$response = $client->get('admin/templates', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$list = json_decode($response->getBody(), true);
echo "Count: " . count($list['data']) . "\n\n";

// 4. Update Template
echo "4. Updating Template...\n";
$response = $client->put("admin/templates/{$id}", [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'name' => 'Updated Eviction Notice'
    ]
]);
$updated = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "New Name: " . ($updated['data']['name'] ?? 'N/A') . "\n\n";

// 5. Delete Template
echo "5. Deleting Template...\n";
$response = $client->delete("admin/templates/{$id}", [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
