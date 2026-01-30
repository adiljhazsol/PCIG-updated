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

// 2. Set Preferences
echo "2. Setting Preferences...\n";
$response = $client->put('admin/notification-settings', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'preferences' => [
            [
                'channel' => 'email',
                'type' => 'deadline',
                'enabled' => true
            ],
            [
                'channel' => 'sms',
                'type' => 'deadline',
                'enabled' => false
            ],
            [
                'channel' => 'in_app',
                'type' => 'payment',
                'enabled' => true
            ]
        ]
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n\n";

// 3. Get Preferences
echo "3. Getting Preferences...\n";
$response = $client->get('admin/notification-settings', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$settings = json_decode($response->getBody(), true);
echo "Total Settings: " . count($settings['data']) . "\n";
foreach ($settings['data'] as $setting) {
    echo "- {$setting['channel']} / {$setting['type']}: " . ($setting['enabled'] ? 'On' : 'Off') . "\n";
}
