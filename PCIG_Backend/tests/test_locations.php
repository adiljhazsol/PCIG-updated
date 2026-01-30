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

// 2. Create Location
echo "2. Creating Location...\n";
$response = $client->post('admin/locations', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'state' => 'GA',
        'county' => 'Fulton',
        'city' => 'Atlanta',
        'rules' => ['redemption_period' => '12 months'],
        'fees' => ['recording_fee' => 25.00],
        'contact_info' => ['clerk' => 'John Doe']
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$location = json_decode($response->getBody(), true);
$locationId = $location['data']['id'];
echo "Created Location ID: " . $locationId . "\n\n";

// 3. List Locations
echo "3. Listing Locations...\n";
$response = $client->get('admin/locations', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$locations = json_decode($response->getBody(), true);
echo "Total Locations: " . count($locations['data']['data']) . "\n\n";

// 4. Update Location
echo "4. Updating Location...\n";
$response = $client->put('admin/locations/' . $locationId, [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'state' => 'GA',
        'county' => 'Fulton',
        'city' => 'Atlanta',
        'rules' => ['redemption_period' => '12 months', 'penalty' => '20%']
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$updated = json_decode($response->getBody(), true);
echo "Updated Rules: " . json_encode($updated['data']['rules']) . "\n\n";

// 5. Delete Location
echo "5. Deleting Location...\n";
$response = $client->delete('admin/locations/' . $locationId, [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n";
