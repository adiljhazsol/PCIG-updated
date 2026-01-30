<?php

require 'vendor/autoload.php';

// Configuration
$baseUrl = 'http://localhost:8000/api';
$timestamp = time();

// 1. Login as admin
echo "Logging in as admin...\n";
$ch = curl_init("{$baseUrl}/auth/admin-login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'email' => 'admin@pcig.com',
    'password' => 'password',
]);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Accept: application/json"]);
$response = curl_exec($ch);
$loginData = json_decode($response, true);
$adminToken = $loginData['data']['token'] ?? null;

if (!$adminToken) {
    die("Admin login failed. Response: " . $response . "\n");
}
echo "Admin logged in successfully.\n";

// 2. List Transactions (with optional filter)
echo "Listing transactions...\n";
$ch = curl_init("{$baseUrl}/admin/transactions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$adminToken}",
    "Accept: application/json",
]);
$response = curl_exec($ch);
$listData = json_decode($response, true);

if (!($listData['success'] ?? false)) {
    die("Failed to list transactions. Response: " . $response . "\n");
}
$count = count($listData['data'] ?? []);
echo "Listed {$count} transactions.\n";

$transactionId = null;
if ($count > 0) {
    $transactionId = $listData['data'][0]['id'];
}

// If no transaction, we can't test show/update efficiently without creating one first.
// Assuming the system has some transactions from previous tests (distributions create transactions).
if (!$transactionId) {
    echo "No transactions found to test show/update.\n";
    // Optional: Trigger a distribution to create a transaction?
    // For now, let's assume there might be one or just skip.
} else {
    // 3. Show Transaction
    echo "Showing transaction ID: {$transactionId}...\n";
    $ch = curl_init("{$baseUrl}/admin/transactions/{$transactionId}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$adminToken}",
        "Accept: application/json",
    ]);
    $response = curl_exec($ch);
    $showData = json_decode($response, true);

    if (($showData['success'] ?? false) && ($showData['data']['id'] ?? 0) == $transactionId) {
        echo "Show transaction successful.\n";
    } else {
        echo "Show transaction failed. Response: " . $response . "\n";
    }

    // 4. Update Transaction Status
    // Be careful not to break data integrity if this is a real transaction, 
    // but for test env it's fine. Let's toggle status or set to same.
    // Let's try setting to 'completed' if it's pending, or 'pending' if it's completed.
    $currentStatus = $showData['data']['status'] ?? 'pending';
    $newStatus = ($currentStatus === 'pending') ? 'completed' : 'pending';

    echo "Updating transaction status from '{$currentStatus}' to '{$newStatus}'...\n";
    $ch = curl_init("{$baseUrl}/admin/transactions/{$transactionId}/status");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['status' => $newStatus]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$adminToken}",
        "Accept: application/json",
    ]);
    $response = curl_exec($ch);
    $updateData = json_decode($response, true);

    if (($updateData['success'] ?? false) && ($updateData['data']['status'] ?? '') === $newStatus) {
        echo "Update transaction status successful.\n";
    } else {
        echo "Update transaction status failed. Response: " . $response . "\n";
    }
}

echo "Admin Transaction Tests Completed.\n";
