<?php

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';

function login($email, $password) {
    global $baseUrl;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/auth/admin-login");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['email' => $email, 'password' => $password]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function request($method, $endpoint, $token, $data = []) {
    global $baseUrl;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl$endpoint");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if (!empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'body' => json_decode($response, true), 'raw' => $response];
}

echo "--- TEST PARCEL RESEARCH MODULE ---\n";

// 1. Login as Admin
echo "Logging in as Admin...\n";
$auth = login('admin@example.com', 'password');
$token = $auth['data']['token'] ?? null;

if (!$token) {
    echo "Admin login failed. Response:\n";
    print_r($auth);
    die();
}

$parcelId = 'PID-RES-' . rand(1000, 9999);
echo "Testing Parcel ID: $parcelId\n";

// 2. Save Research Notes
echo "Saving Research Notes...\n";
$save = request('POST', '/admin/parcel/research', $token, [
    'parcel_id' => $parcelId,
    'county' => 'Test County',
    'research_notes' => 'Initial due diligence. Looks promising.'
]);

echo "Save Response Code: " . $save['code'] . "\n";
print_r($save['body']);

// 3. Search Parcel
echo "Searching Parcel...\n";
$search = request('GET', "/admin/parcel/search?parcel_id=$parcelId", $token);

echo "Search Response Code: " . $search['code'] . "\n";
print_r($search['body']);
