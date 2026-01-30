<?php

$baseUrl = 'http://localhost:8000/api';
$email = 'admin@pcig.com';
$password = 'password';

function login($email, $password, $baseUrl) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/auth/admin-login");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['email' => $email, 'password' => $password]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function createProperty($token, $baseUrl) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/properties");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'address' => '123 Sheriff Test St ' . time(),
        'city' => 'Test City',
        'state' => 'TS',
        'zip_code' => '12345',
        'parcel_id' => 'PID-SHERIFF-' . time(),
        'status' => 'active',
        'workflow_stage' => 'sheriff',
        'county' => 'Test County',
        'price_per_share' => 100,
        'purchase_price' => 100000,
        'current_value' => 120000,
        'total_shares' => 1000,
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function listSheriffProperties($token, $baseUrl) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/sheriff/properties");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function updateSheriffSale($token, $baseUrl, $id, $data) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/sheriff/$id/update");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function completeSheriffSale($token, $baseUrl, $id) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/sheriff/$id/complete");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

echo "1. Logging in...\n";
$auth = login($email, $password, $baseUrl);
if (!isset($auth['data']['token'])) {
    echo "Login failed.\n";
    print_r($auth);
    exit(1);
}
$token = $auth['data']['token'];
echo "Login successful.\n\n";

echo "2. Creating test property with sheriff stage...\n";
$property = createProperty($token, $baseUrl);
if (!isset($property['success']) || !$property['success']) {
    echo "Property creation failed.\n";
    print_r($property);
    exit(1);
}
$propertyId = $property['data']['id'];
echo "Property created. ID: $propertyId\n\n";

echo "3. Listing Sheriff properties...\n";
$list = listSheriffProperties($token, $baseUrl);
if (!isset($list['success']) || !$list['success']) {
    echo "List failed.\n";
    print_r($list);
    exit(1);
}
$found = false;
foreach ($list['data'] as $p) {
    if ($p['id'] == $propertyId) {
        $found = true;
        break;
    }
}
if ($found) {
    echo "Property found in sheriff list.\n\n";
} else {
    echo "Property NOT found in sheriff list.\n";
    exit(1);
}

echo "4. Updating Sheriff Sale details...\n";
$updateData = [
    'sale_date' => date('Y-m-d', strtotime('+1 week')),
    'status' => 'scheduled',
    'winning_bid' => 150000.00,
    'winner_info' => 'John Doe',
    'notes' => 'Test Notes'
];
$update = updateSheriffSale($token, $baseUrl, $propertyId, $updateData);
if (!isset($update['success']) || !$update['success']) {
    echo "Update failed.\n";
    print_r($update);
    exit(1);
}
if ($update['data']['winning_bid'] == 150000.00) {
    echo "Sheriff sale updated successfully.\n\n";
} else {
    echo "Sheriff sale update failed validation.\n";
    print_r($update);
    exit(1);
}

echo "5. Completing Sheriff Sale...\n";
$complete = completeSheriffSale($token, $baseUrl, $propertyId);
if (!isset($complete['success']) || !$complete['success']) {
    echo "Completion failed.\n";
    print_r($complete);
    exit(1);
}
if ($complete['data']['status'] === 'completed' && $complete['data']['property']['workflow_stage'] === 'reo_disposition') {
    echo "Sheriff sale completed successfully and property moved to reo_disposition.\n\n";
} else {
    echo "Completion verification failed.\n";
    print_r($complete);
    exit(1);
}

echo "6. Verifying removal from Sheriff list...\n";
$list2 = listSheriffProperties($token, $baseUrl);
$found2 = false;
foreach ($list2['data'] as $p) {
    if ($p['id'] == $propertyId) {
        $found2 = true;
        break;
    }
}
if (!$found2) {
    echo "Property successfully removed from sheriff list.\n";
} else {
    echo "Property still present in sheriff list (unexpected).\n";
    exit(1);
}
