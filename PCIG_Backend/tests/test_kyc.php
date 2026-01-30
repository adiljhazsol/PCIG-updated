<?php

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';

function request($method, $url, $token = null, $data = null) {
    global $baseUrl;
    $ch = curl_init($baseUrl . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    if ($data) {
        // Use JSON for complex nested data (documents array)
        $jsonData = json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
        $headers[] = 'Content-Type: application/json';
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'body' => json_decode($response, true)];
}

// 1. Register/Login as Investor
$email = 'kyc_test_' . time() . '@example.com';
echo "1. Registering Investor ($email)...\n";
$register = request('POST', '/auth/register', null, [
    'first_name' => 'KYC',
    'last_name' => 'Tester',
    'email' => $email,
    'password' => 'password',
    'password_confirmation' => 'password',
    'phone' => '555-0199',
    'address' => '123 KYC Lane',
    'ssn' => '000-00-0000',
    'bank_account' => '123456789'
]);

if ($register['code'] !== 201) {
    echo "Registration failed: " . print_r($register['body'], true) . "\n";
    exit;
}

$token = $register['body']['data']['token'];
echo "Registration successful. Token acquired.\n\n";

// 2. Check Initial Status
echo "2. Checking Initial KYC Status...\n";
$status1 = request('GET', '/investor/kyc/status', $token);
echo "Status: " . ($status1['body']['data']['status'] ?? 'unknown') . "\n\n";

// 3. Submit KYC Documents
echo "3. Submitting KYC Documents...\n";
$submit = request('POST', '/investor/kyc/submit', $token, [
    'documents' => [
        [
            'type' => 'passport',
            'file_path' => 'mock_passport.jpg' // Mocking file upload
        ],
        [
            'type' => 'utility_bill',
            'file_path' => 'mock_bill.pdf'
        ]
    ]
]);

if ($submit['code'] === 200) {
    echo "Submission successful.\n";
    echo "Status: " . $submit['body']['data']['status'] . "\n";
    echo "Documents Count: " . count($submit['body']['data']['documents']) . "\n";
} else {
    echo "Submission failed: " . print_r($submit['body'], true) . "\n";
}
echo "\n";

// 4. Check Status Again
echo "4. Checking Updated KYC Status...\n";
$status2 = request('GET', '/investor/kyc/status', $token);
echo "Status: " . $status2['body']['data']['status'] . "\n";
echo "Verified At: " . ($status2['body']['data']['verified_at'] ?? 'null') . "\n";
