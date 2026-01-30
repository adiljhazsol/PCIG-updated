<?php

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';
$email = 'investor@pcig.com';
$password = 'password';

echo "Testing Investor Fund Investment Summary Endpoint...\n\n";

// 1. Login
echo "1. Logging in as Investor...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/auth/login");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'email' => $email,
    'password' => $password,
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

if ($httpCode !== 200 || !isset($data['success']) || !$data['success']) {
    echo "[FAIL] Investor Login: Failed to login\n";
    echo "Response: " . $response . "\n";
    exit(1);
}

$token = $data['data']['token'];
echo "[PASS] Investor Login\n";

// 2. Get Fund Investment Summary
// Assuming fund ID 1 exists and has investment (setup by setup_fund_investment_data.php)
$fundId = 1; 

echo "\n2. Testing Fund Investment Summary for Fund {$fundId}...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/investor/funds/{$fundId}/investment-summary");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

if ($httpCode === 200 && isset($data['success']) && $data['success']) {
    echo "[PASS] Get Fund Investment Summary\n";
    if ($data['data']['has_investment']) {
        echo "   - Shares: " . $data['data']['investment']['shares'] . "\n";
        echo "   - Amount: $" . $data['data']['investment']['amount'] . "\n";
        echo "   - Current Value: $" . $data['data']['current_value'] . "\n";
        echo "   - Unrealized Gain: $" . $data['data']['unrealized_gain'] . "\n";
    } else {
        echo "   - No investment found (unexpected if setup ran)\n";
    }
} else {
    echo "[FAIL] Get Fund Investment Summary: Failed with code $httpCode\n";
    echo "Response: " . $response . "\n";
    exit(1);
}

echo "\nFund Investment Summary Test Completed.\n";
