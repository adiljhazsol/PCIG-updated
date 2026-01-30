<?php

require 'vendor/autoload.php';

$baseUrl = 'http://localhost:8000/api';
$adminEmail = 'admin@pcig.com';
$adminPassword = 'password';
$investorEmail = 'investor_portfolio_' . time() . '@example.com';
$investorPassword = 'password';

$adminToken = '';
$investorToken = '';
$propertyId = '';
$fundId = '';

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

// 1. Admin Login
logMessage("Logging in as Admin...");
$response = makeRequest("{$baseUrl}/auth/admin-login", 'POST', [
    'email' => $adminEmail,
    'password' => $adminPassword
]);

if ($response['code'] === 200 && $response['body']['success']) {
    $adminToken = $response['body']['data']['token'];
    logMessage("Admin login successful.");
} else {
    logMessage("Admin login failed: " . json_encode($response));
    exit(1);
}

// 2. Create Property
logMessage("Creating Test Property...");
$propertyData = [
    'address' => '123 Portfolio St ' . time(),
    'city' => 'Portfolio City',
    'state' => 'PC',
    'zip_code' => '12345',
    'parcel_id' => 'PARCEL-' . time(),
    'type' => 'Residential',
    'status' => 'active',
    'purchase_price' => 200000,
    'current_value' => 200000,
    'description' => 'Test Property for Portfolio',
    'price_per_share' => 100,
    'total_shares' => 2000,
    'available_shares' => 2000,
    'roi' => 10,
    'purchase_date' => date('Y-m-d'),
    'min_investment' => 1000
];

$response = makeRequest("{$baseUrl}/admin/properties", 'POST', $propertyData, $adminToken);
if ($response['code'] === 201 && $response['body']['success']) {
    $propertyId = $response['body']['data']['id'];
    logMessage("Property created successfully. ID: $propertyId");
} else {
    logMessage("Property creation failed: " . json_encode($response));
    exit(1);
}

// 3. Create Fund
logMessage("Creating Test Fund...");
$fundData = [
    'name' => 'Portfolio Fund ' . time(),
    'slug' => 'portfolio-fund-' . time(),
    'description' => 'Test Fund for Portfolio',
    'min_investment' => 5000,
    'total_assets' => 1000000,
    'status' => 'open',
    'current_nav' => 1000000,
    'total_shares' => 10000,
    'available_shares' => 10000,
    'price_per_share' => 100,
    'launch_date' => date('Y-m-d'),
    'close_date' => date('Y-m-d', strtotime('+5 years'))
];

$response = makeRequest("{$baseUrl}/admin/funds", 'POST', $fundData, $adminToken);
if ($response['code'] === 201 && $response['body']['success']) {
    $fundId = $response['body']['data']['id'];
    logMessage("Fund created successfully. ID: $fundId");
} else {
    logMessage("Fund creation failed: " . json_encode($response));
    exit(1);
}

// 4. Register Investor
logMessage("Registering Investor...");
$registerData = [
    'first_name' => 'Portfolio',
    'last_name' => 'Investor',
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
    logMessage("Investor registration failed: " . json_encode($response));
    exit(1);
}

// 5. Invest in Property
logMessage("Investing in Property...");
$investData = [
    'amount' => 5000, // 50 shares
    'shares' => 50
];

$response = makeRequest("{$baseUrl}/investor/properties/{$propertyId}/invest", 'POST', $investData, $investorToken);
if (($response['code'] === 200 || $response['code'] === 201) && $response['body']['success']) {
    logMessage("Property investment successful.");
} else {
    logMessage("Property investment failed: " . json_encode($response));
    exit(1);
}

// 6. Invest in Fund
logMessage("Investing in Fund...");
$fundInvestData = [
    'amount' => 10000, // 100 shares
    'shares' => 100
];

$response = makeRequest("{$baseUrl}/investor/funds/{$fundId}/invest", 'POST', $fundInvestData, $investorToken);
if (($response['code'] === 200 || $response['code'] === 201) && $response['body']['success']) {
    logMessage("Fund investment successful.");
} else {
    logMessage("Fund investment failed: " . json_encode($response));
    exit(1);
}

// 7. Test GET /investor/investments
logMessage("Testing GET /investor/investments...");
$response = makeRequest("{$baseUrl}/investor/investments", 'GET', [], $investorToken);

if ($response['code'] === 200 && $response['body']['success']) {
    logMessage("Portfolio endpoint response successful.");
    
    $summary = $response['body']['data']['summary'];
    $propInvs = $response['body']['data']['property_investments'];
    $fundInvs = $response['body']['data']['fund_investments'];

    logMessage("Summary: " . json_encode($summary));

    // Verify totals
    $expectedPropTotal = 5000;
    $expectedFundTotal = 10000;
    $expectedTotal = 15000;

    if ($summary['total_property_investment'] == $expectedPropTotal &&
        $summary['total_fund_investment'] == $expectedFundTotal &&
        $summary['total_investment'] == $expectedTotal) {
        logMessage("Totals match expected values.");
    } else {
        logMessage("Totals MISMATCH.");
        logMessage("Expected: Prop=$expectedPropTotal, Fund=$expectedFundTotal, Total=$expectedTotal");
        logMessage("Actual: Prop={$summary['total_property_investment']}, Fund={$summary['total_fund_investment']}, Total={$summary['total_investment']}");
        exit(1);
    }

    // Verify list items
    if (count($propInvs) > 0 && count($fundInvs) > 0) {
        logMessage("Property and Fund investments returned in list.");
    } else {
        logMessage("Missing investments in list.");
        exit(1);
    }

} else {
    logMessage("Portfolio endpoint failed: " . json_encode($response));
    exit(1);
}

logMessage("Investor Portfolio Tests Completed.");
