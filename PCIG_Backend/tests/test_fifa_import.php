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
    echo "Raw response: " . $response . "\n";
    return json_decode($response, true);
}

function uploadFile($token, $baseUrl, $filePath) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/fifa/import");
    curl_setopt($ch, CURLOPT_POST, 1);
    
    $cfile = new CURLFile($filePath, 'application/csv', 'test_fifa.csv');
    $data = ['file' => $cfile];
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
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
    echo "Raw response: " . $response . "\n";
    return json_decode($response, true);
}

function listImports($token, $baseUrl) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/fifa/imports");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

function showImport($token, $baseUrl, $id) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/fifa/imports/$id");
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

echo "2. Uploading file...\n";
$upload = uploadFile($token, $baseUrl, __DIR__ . '/test_fifa.csv');
print_r($upload);
if (!isset($upload['success']) || !$upload['success']) {
    echo "Upload failed.\n";
    exit(1);
}
$importId = $upload['data']['id'];
echo "Upload successful. Import ID: $importId\n\n";

echo "3. Listing imports...\n";
$list = listImports($token, $baseUrl);
print_r($list);
if (!isset($list['success']) || !$list['success']) {
    echo "List failed.\n";
    exit(1);
}
echo "List successful.\n\n";

echo "4. Showing import details...\n";
$show = showImport($token, $baseUrl, $importId);
print_r($show);
if (!isset($show['success']) || !$show['success']) {
    echo "Show failed.\n";
    exit(1);
}
echo "Show successful.\n\n";
