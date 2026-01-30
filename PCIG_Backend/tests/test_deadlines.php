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

// 2. Create Deadline
echo "2. Creating Deadline...\n";
$deadlineDate = date('Y-m-d', strtotime('+7 days'));
$response = $client->post('admin/deadlines', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'type' => 'tax_appeal',
        'deadline_date' => $deadlineDate,
        'description' => 'File tax appeal for Property 123',
        'status' => 'pending'
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$deadline = json_decode($response->getBody(), true);
$deadlineId = $deadline['data']['id'];
echo "Created Deadline ID: " . $deadlineId . "\n\n";

// 3. List Deadlines
echo "3. Listing Deadlines...\n";
$response = $client->get('admin/deadlines', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$deadlines = json_decode($response->getBody(), true);
echo "Total Deadlines: " . count($deadlines['data']) . "\n\n";

// 4. Update Deadline
echo "4. Updating Deadline...\n";
$response = $client->put("admin/deadlines/{$deadlineId}", [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'status' => 'completed',
        'description' => 'Filed tax appeal successfully'
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$updatedDeadline = json_decode($response->getBody(), true);
echo "Updated Status: " . $updatedDeadline['data']['status'] . "\n\n";

// 5. Delete Deadline
echo "5. Deleting Deadline...\n";
$response = $client->delete("admin/deadlines/{$deadlineId}", [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n\n";
