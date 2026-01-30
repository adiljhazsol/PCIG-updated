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

// 2. Send Invitation
echo "2. Sending Invitation...\n";
$email = 'newinvestor' . time() . '@example.com';
$response = $client->post('admin/investors/invite', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'email' => $email
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$invite = json_decode($response->getBody(), true);
$inviteId = $invite['data']['id'];
echo "Invitation Sent to: " . $invite['data']['email'] . "\n";
echo "Token: " . $invite['data']['token'] . "\n\n";

// 3. List Invitations
echo "3. Listing Invitations...\n";
$response = $client->get('admin/investors/invitations', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json'
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$body = $response->getBody();
file_put_contents('error_log.json', $body);
$list = json_decode($body, true);

if (isset($list['message'])) {
    echo "Error Message: " . $list['message'] . "\n";
}
if (isset($list['exception'])) {
    echo "Exception: " . $list['exception'] . "\n";
}

echo "Total Invitations: " . count($list['data']['data']) . "\n\n";

// 4. Resend Invitation
echo "4. Resending Invitation...\n";
$response = $client->post('admin/investors/invitations/' . $inviteId . '/resend', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$resent = json_decode($response->getBody(), true);
echo "New Token: " . $resent['data']['token'] . "\n";
if ($invite['data']['token'] !== $resent['data']['token']) {
    echo "Token successfully rotated.\n";
} else {
    echo "ERROR: Token did not change.\n";
}
