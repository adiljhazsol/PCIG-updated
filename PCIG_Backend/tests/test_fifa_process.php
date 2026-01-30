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
    if ($response === false) {
        echo "Curl error: " . curl_error($ch) . "\n";
    }
    curl_close($ch);
    // echo "Raw response: " . $response . "\n";
    return json_decode($response, true);
}

function createProperty($token, $baseUrl) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/properties");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'address' => '123 FIFA Test St ' . time(),
        'city' => 'Test City',
        'state' => 'TS',
        'zip_code' => '12345',
        'parcel_id' => 'PID-' . time(),
        'status' => 'active',
        'workflow_stage' => 'fifa_processing',
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
    if ($response === false) {
        echo "Curl error: " . curl_error($ch) . "\n";
    }
    curl_close($ch);
    // echo "Raw response: " . $response . "\n";
    return json_decode($response, true);
}

function listProcessing($token, $baseUrl) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/fifa/processing");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    if ($response === false) {
        echo "Curl error: " . curl_error($ch) . "\n";
    }
    curl_close($ch);
    // echo "Raw response: " . $response . "\n";
    return json_decode($response, true);
}

function processProperty($token, $baseUrl, $id, $action, $nextStage = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/fifa/$id/process");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    
    $data = ['action' => $action];
    if ($nextStage) {
        $data['next_stage'] = $nextStage;
    }
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    if ($response === false) {
        echo "Curl error: " . curl_error($ch) . "\n";
    }
    curl_close($ch);
    // echo "Raw response: " . $response . "\n";
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

echo "2. Creating test property with fifa_processing stage...\n";
$property = createProperty($token, $baseUrl);
if (!isset($property['success']) || !$property['success']) {
    echo "Property creation failed.\n";
    print_r($property);
    exit(1);
}
$propertyId = $property['data']['id'];
echo "Property created. ID: $propertyId\n\n";

echo "3. Listing FIFA processing properties...\n";
$list = listProcessing($token, $baseUrl);
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
    echo "Property found in processing list.\n\n";
} else {
    echo "Property NOT found in processing list.\n";
    exit(1);
}

echo "4. Approving property (moving to sheriff)...\n";
$process = processProperty($token, $baseUrl, $propertyId, 'approve', 'sheriff');
if (!isset($process['success']) || !$process['success']) {
    echo "Process failed.\n";
    print_r($process);
    exit(1);
}
if ($process['data']['workflow_stage'] === 'sheriff') {
    echo "Property successfully moved to sheriff stage.\n\n";
} else {
    echo "Property stage update failed. Current stage: " . $process['data']['workflow_stage'] . "\n";
    exit(1);
}

echo "5. Verifying removal from processing list...\n";
$list2 = listProcessing($token, $baseUrl);
$found2 = false;
foreach ($list2['data'] as $p) {
    if ($p['id'] == $propertyId) {
        $found2 = true;
        break;
    }
}
if (!$found2) {
    echo "Property successfully removed from processing list.\n";
} else {
    echo "Property still present in processing list.\n";
    exit(1);
}
