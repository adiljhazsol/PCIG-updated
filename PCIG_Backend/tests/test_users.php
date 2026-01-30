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

// 2. List Users
echo "2. Listing Users...\n";
$response = $client->get('admin/users', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$users = json_decode($response->getBody(), true);
echo "Total Users: " . count($users['data']) . "\n\n";

// 3. Create User
echo "3. Creating User...\n";
$email = 'testuser_' . time() . '@example.com';
$response = $client->post('admin/users', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'name' => 'Test User',
        'email' => $email,
        'password' => 'password123',
        'roles' => ['investor'] // Assuming 'investor' role exists
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$createdUser = json_decode($response->getBody(), true);
if (!isset($createdUser['data']['id'])) {
    echo "Create Failed: " . $response->getBody() . "\n";
    exit;
}
$userId = $createdUser['data']['id'];
echo "Created User ID: " . $userId . "\n\n";

// 4. Update User
echo "4. Updating User...\n";
$response = $client->put("admin/users/{$userId}", [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'name' => 'Test User Updated',
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$updatedUser = json_decode($response->getBody(), true);
echo "Updated Name: " . $updatedUser['data']['name'] . "\n\n";

// 5. Assign Roles (Update Roles)
echo "5. Assigning Roles...\n";
$response = $client->put("admin/users/{$userId}/roles", [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'roles' => ['admin'] // Change to admin for test
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n\n";

// 6. Delete User
echo "6. Deleting User...\n";
$response = $client->delete("admin/users/{$userId}", [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n\n";

// 7. Verify Deletion
echo "7. Verifying Deletion...\n";
$response = $client->get("admin/users/{$userId}", [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . " (Expected 404)\n";
