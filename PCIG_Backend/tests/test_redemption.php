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
        'address' => '123 Redemption Test St ' . time(),
        'city' => 'Test City',
        'state' => 'TS',
        'zip_code' => '12345',
        'parcel_id' => 'PID-REDEMPTION-' . time(),
        'status' => 'active',
        'workflow_stage' => 'redemption',
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

function listRedemptionProperties($token, $baseUrl) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/redemption/properties");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function updateRedemption($token, $baseUrl, $id, $data) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/redemption/$id/update");
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

function redeemProperty($token, $baseUrl, $id) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/redemption/$id/redeem");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'redemption_amount' => 105000.00,
        'redeemed_at' => date('Y-m-d')
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

echo "1. Logging in...\n";
$auth = login($email, $password, $baseUrl);
if (!isset($auth['data']['token'])) {
    echo "Login failed.\n";
    print_r($auth);
    exit(1);
}
$token = $auth['data']['token'];
echo "Login successful.\n\n";

echo "2. Creating test property with redemption stage...\n";
$property = createProperty($token, $baseUrl);
if (!isset($property['success']) || !$property['success']) {
    echo "Property creation failed.\n";
    print_r($property);
    exit(1);
}
$propertyId = $property['data']['id'];
echo "Property created. ID: $propertyId\n\n";

echo "3. Listing Redemption properties...\n";
$list = listRedemptionProperties($token, $baseUrl);
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
    echo "Property found in redemption list.\n\n";
} else {
    echo "Property NOT found in redemption list.\n";
    exit(1);
}

echo "4. Updating Redemption Tracking details...\n";
$updateData = [
    'redemption_deadline' => date('Y-m-d', strtotime('+30 days')),
    'status' => 'pending',
    'notes' => 'Redemption notes test'
];
$update = updateRedemption($token, $baseUrl, $propertyId, $updateData);
if (!isset($update['success']) || !$update['success']) {
    echo "Update failed.\n";
    print_r($update);
    exit(1);
}
if ($update['data']['notes'] === 'Redemption notes test') {
    echo "Redemption tracking updated successfully.\n\n";
} else {
    echo "Redemption tracking update failed validation.\n";
    print_r($update);
    exit(1);
}

echo "5. Redeeming Property...\n";
$redeem = redeemProperty($token, $baseUrl, $propertyId);
if (!isset($redeem['success']) || !$redeem['success']) {
    echo "Redemption failed.\n";
    print_r($redeem);
    exit(1);
}
if ($redeem['data']['status'] === 'redeemed' && $redeem['data']['property']['workflow_stage'] === 'completed') {
    echo "Property redeemed successfully and moved to completed stage.\n\n";
} else {
    echo "Redemption verification failed.\n";
    print_r($redeem);
    exit(1);
}

echo "6. Verifying removal from Redemption list...\n";
$list2 = listRedemptionProperties($token, $baseUrl);
$found2 = false;
foreach ($list2['data'] as $p) {
    if ($p['id'] == $propertyId) {
        $found2 = true;
        break;
    }
}
if (!$found2) {
    echo "Property successfully removed from redemption list.\n";
} else {
    echo "Property still present in redemption list (unexpected).\n";
    exit(1);
}
