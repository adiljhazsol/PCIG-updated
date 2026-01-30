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

echo "--- TEST QUIET TITLE V2 ---\n";

// 1. Login as Admin
echo "Logging in as Admin...\n";
$auth = login('admin@example.com', 'password');
$token = $auth['data']['token'] ?? null;

if (!$token) {
    echo "Admin login failed. Response:\n";
    print_r($auth);
    die();
}

// 2. Find a Property or move one to 'quiet_title' stage
echo "Finding a property...\n";
$allProperties = request('GET', '/admin/properties', $token);
if ($allProperties['code'] != 200) die("Failed to list properties.\n");

$propertyId = $allProperties['body']['data'][0]['id'] ?? null;
if (!$propertyId) die("No properties found.\n");

echo "Using Property ID: $propertyId\n";

// Move to quiet_title stage first (using stage endpoint)
echo "Moving property to 'quiet_title' stage...\n";
$stageUpdate = request('PUT', "/admin/properties/$propertyId/stage", $token, ['workflow_stage' => 'quiet_title']);
if ($stageUpdate['code'] != 200) {
    echo "Failed to move property to quiet_title stage. Code: " . $stageUpdate['code'] . "\n";
} else {
    echo "Property moved to quiet_title stage.\n";
}

// 3. File Quiet Title Action
echo "Filing Quiet Title Action...\n";
$file = request('POST', "/admin/quiet-title/$propertyId/file", $token, [
    'court_date' => '2026-04-01',
    'title_issues' => 'Old lien found',
    'notes' => 'Test quiet title filing',
    'filing_fee' => 200.00
]);
echo "File Response Code: " . $file['code'] . "\n";

if ($file['code'] == 201 || $file['code'] == 200) {
    echo "Filing successful.\n";
    print_r($file['body']);
    $caseId = $file['body']['data']['id'];

    // 4. Update Quiet Title Status
    echo "Updating Quiet Title Status (Case ID: $caseId)...\n";
    $update = request('PUT', "/admin/quiet-title/case/$caseId/update", $token, [
        'status' => 'decided',
        'court_outcome' => 'won', // Should trigger move to auction
        'notes' => 'Case won, ready for auction'
    ]);
    echo "Update Response Code: " . $update['code'] . "\n";
    print_r($update['body']);
    
    // Check if property moved to auction
    $propCheck = request('GET', "/admin/properties/$propertyId", $token);
    echo "Property Workflow Stage: " . ($propCheck['body']['data']['workflow_stage'] ?? 'unknown') . "\n";
} else {
    echo "Filing failed. Raw response:\n";
    echo $file['raw'] . "\n";
}

// 5. List Quiet Title Properties
echo "Listing Quiet Title Properties...\n";
$list = request('GET', '/admin/quiet-title/properties', $token);
print_r($list['body']['data'] ?? []);
