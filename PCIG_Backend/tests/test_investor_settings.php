<?php

require 'vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';
$investorEmail = 'investor_settings_test_' . time() . '@example.com';
$investorPassword = 'password';
$investorToken = '';

function logMessage($message) {
    echo $message . "\n";
}

function makeRequest($url, $method = 'GET', $data = [], $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json',
        $token ? "Authorization: Bearer $token" : ''
    ]);

    if (!empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'body' => json_decode($response, true)];
}

// 1. Register a new investor
logMessage("Registering new investor...");
$registerData = [
    'first_name' => 'Investor',
    'last_name' => 'SettingsTest',
    'email' => $investorEmail,
    'password' => $investorPassword,
    'password_confirmation' => $investorPassword,
    'role_type' => 'investor'
];

$response = makeRequest("{$baseUrl}/auth/register", 'POST', $registerData);

if ($response['code'] === 201 || $response['code'] === 200) {
    $investorToken = $response['body']['data']['token'];
    logMessage("Investor registered successfully.");
} else {
    logMessage("Registration failed: " . json_encode($response));
    exit(1);
}

// 2. Test GET /settings/profile
logMessage("Testing GET /investor/settings/profile...");
$response = makeRequest("{$baseUrl}/investor/settings/profile", 'GET', [], $investorToken);
if ($response['code'] === 200 && $response['body']['success']) {
    logMessage("Get profile successful.");
    // Check if name is composed correctly or returned
    // Since User model has name in fillable but likely relies on first_name/last_name for display or concatenation?
    // The controller returns $user->name. Let's see what it is.
    if (isset($response['body']['data']['user']['name'])) {
        logMessage("User name: " . $response['body']['data']['user']['name']);
    }
} else {
    logMessage("Get profile failed: " . json_encode($response));
    exit(1);
}

// 3. Test PUT /settings/profile (Update Profile)
logMessage("Testing PUT /investor/settings/profile...");
$updateData = [
    'name' => 'Updated Name', // This might update 'name' column if it exists
    'phone' => '1234567890',
    'address' => '123 Test St, Test City'
];

$response = makeRequest("{$baseUrl}/investor/settings/profile", 'PUT', $updateData, $investorToken);
if ($response['code'] === 200 && $response['body']['success']) {
    logMessage("Update profile successful.");
    $updatedProfile = $response['body']['data']['profile'];
    if ($updatedProfile['phone'] === '1234567890' && $updatedProfile['address'] === '123 Test St, Test City') {
        logMessage("Profile data updated correctly.");
    } else {
        logMessage("Profile data mismatch: " . json_encode($updatedProfile));
        exit(1);
    }
} else {
    logMessage("Update profile failed: " . json_encode($response));
    exit(1);
}

// 4. Test PUT /settings/password (Change Password)
logMessage("Testing PUT /investor/settings/password...");
$newPassword = 'newpassword123';
$passwordData = [
    'current_password' => $investorPassword,
    'password' => $newPassword,
    'password_confirmation' => $newPassword
];

$response = makeRequest("{$baseUrl}/investor/settings/password", 'PUT', $passwordData, $investorToken);
if ($response['code'] === 200 && $response['body']['success']) {
    logMessage("Change password successful.");
} else {
    logMessage("Change password failed: " . json_encode($response));
    exit(1);
}

// 5. Verify login with new password
logMessage("Verifying login with new password...");
$loginData = [
    'email' => $investorEmail,
    'password' => $newPassword
];

$response = makeRequest("{$baseUrl}/auth/login", 'POST', $loginData);
if ($response['code'] === 200 && isset($response['body']['data']['token'])) {
    logMessage("Login with new password successful.");
} else {
    logMessage("Login with new password failed: " . json_encode($response));
    exit(1);
}

logMessage("Investor Settings Tests Completed.");
