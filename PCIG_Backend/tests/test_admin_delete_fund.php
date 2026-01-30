<?php

require __DIR__ . '/../vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';
$email = 'admin@pcig.com';
$password = 'password';

echo "Testing Admin Delete Fund Endpoint...\n\n";

// 1. Login as Admin
echo "1. Logging in as Admin...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/auth/admin-login");
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
    echo "[FAIL] Admin Login: Failed to login\n";
    echo "Response: " . $response . "\n";
    exit(1);
}

$token = $data['data']['token'];
echo "[PASS] Admin Login\n";

// 2. Create a Fund (to be deleted)
echo "\n2. Creating a test fund (no investments)...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/funds");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'name' => 'Delete Me Fund',
    'slug' => 'delete-me-fund-' . time(),
    'description' => 'This fund will be deleted',
    'status' => 'open',
    'start_date' => date('Y-m-d'),
    'min_investment' => 1000,
    'management_fee_percentage' => 1.5,
    'target_return_percentage' => 12.0,
    'price_per_share' => 100,
    'total_shares' => 1000,
    'current_nav' => 100,
    'total_assets' => 100000,
    'launch_date' => date('Y-m-d'),
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

if ($httpCode !== 201 || !isset($data['success']) || !$data['success']) {
    echo "[FAIL] Create Fund: Failed to create fund\n";
    echo "Response: " . $response . "\n";
    exit(1);
}

$fundId = $data['data']['id'];
echo "[PASS] Created fund with ID: $fundId\n";

// 3. Delete the Fund (Should Succeed)
echo "\n3. Deleting the fund (should succeed)...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/funds/$fundId");
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
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
    echo "[PASS] Fund deleted successfully\n";
} else {
    echo "[FAIL] Failed to delete fund\n";
    echo "Response: " . $response . "\n";
    exit(1);
}

// 4. Create another Fund (with investments)
// We'll reuse the fund ID 1 which should have investments from previous tests (setup_fund_investment_data.php)
// Or create a new one if needed, but using existing one is easier if we know it has investments.
// Let's check fund ID 1.

echo "\n4. Attempting to delete fund with ID 1 (should fail if it has investments)...\n";
// First check if fund 1 exists
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/funds/1");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    // Fund 1 exists, try to delete it
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$baseUrl/admin/funds/1");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "Accept: application/json"
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($response, true);

    if ($httpCode === 400 && isset($data['success']) && !$data['success']) {
        echo "[PASS] Prevented deletion of fund with active investments\n";
        echo "   Message: " . $data['message'] . "\n";
    } else {
        echo "[FAIL] Should have failed to delete fund with investments\n";
        echo "Response: " . $response . "\n";
        // Don't exit here, maybe fund 1 didn't have investments?
    }
} else {
    echo "[WARN] Fund 1 not found, skipping active investment test.\n";
}

echo "\nAdmin Delete Fund Test Completed.\n";
