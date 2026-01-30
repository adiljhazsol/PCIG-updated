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

// 1. Login as Admin
echo "1. Logging in as Admin...\n";
$login = request('POST', '/auth/admin-login', null, [
    'email' => 'admin@pcig.com',
    'password' => 'password'
]);

if ($login['code'] !== 200) {
    echo "Login failed.\n";
    exit;
}

$token = $login['body']['data']['token'];
echo "Login successful.\n\n";

// 2. Get Accounts
echo "2. Fetching Chart of Accounts...\n";
$accounts = request('GET', '/admin/ledger/accounts', $token);
echo "Accounts Found: " . count($accounts['body']['data']) . "\n";
$cashId = null;
$equityId = null;

foreach ($accounts['body']['data'] as $acc) {
    if ($acc['name'] === 'Cash') $cashId = $acc['id'];
    if ($acc['name'] === 'Owner Equity') $equityId = $acc['id'];
}
echo "Cash ID: $cashId, Equity ID: $equityId\n\n";

// 3. Post Manual Journal Entry (Investment Capital)
echo "3. Posting Journal Entry (Owner Investment)...\n";
$entry = request('POST', '/admin/ledger/entry', $token, [
    'entry_date' => date('Y-m-d'),
    'description' => 'Initial Capital Investment',
    'entries' => [
        [
            'account_id' => $cashId,
            'debit' => 50000,
            'credit' => 0
        ],
        [
            'account_id' => $equityId,
            'debit' => 0,
            'credit' => 50000
        ]
    ]
]);

echo "Response Code: " . $entry['code'] . "\n";
print_r($entry['body']);
echo "\n";

// 4. Verify Balances
echo "4. Verifying Account Balances...\n";
$accountsUpdated = request('GET', '/admin/ledger/accounts', $token);
foreach ($accountsUpdated['body']['data'] as $acc) {
    if ($acc['id'] == $cashId || $acc['id'] == $equityId) {
        echo "{$acc['name']}: {$acc['balance']}\n";
    }
}
