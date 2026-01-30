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
$adminId = $login['data']['user']['id'];
echo "Token obtained.\n\n";

// 2. Create Escalation Rule
echo "2. Creating Escalation Rule...\n";
$response = $client->post('admin/notifications/escalations', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'trigger_type' => 'deadline_missed',
        'delay_hours' => 48,
        'escalate_to_user_id' => $adminId,
        'description' => 'Escalate if deadline missed by 48 hours'
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$rule = json_decode($response->getBody(), true);
$ruleId = $rule['data']['id'];
echo "Created Rule ID: " . $ruleId . "\n\n";

// 3. List Escalation Rules
echo "3. Listing Rules...\n";
$response = $client->get('admin/notifications/escalations', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$rules = json_decode($response->getBody(), true);
echo "Total Rules: " . count($rules['data']) . "\n\n";

// 4. Send Notification (Self)
echo "4. Sending Notification...\n";
$response = $client->post('admin/notifications/send', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'user_id' => $adminId,
        'message' => 'Test notification message',
        'type' => 'info'
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n\n";

// 5. List Notifications
echo "5. Listing Notifications...\n";
$response = $client->get('admin/notifications', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$notifications = json_decode($response->getBody(), true);
echo "Total Notifications: " . count($notifications['data']['data']) . "\n";
// Check if our message is there
if (count($notifications['data']['data']) > 0) {
    echo "Latest Message: " . $notifications['data']['data'][0]['data']['message'] . "\n\n";
}
