<?php

require __DIR__ . '/vendor/autoload.php';

function callApi($method, $url, $data = [], $token = null) {
    $curl = curl_init();
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }

    $options = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
    ];

    if (!empty($data)) {
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
    }

    curl_setopt_array($curl, $options);
    $response = curl_exec($curl);
    $err = curl_error($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($err) {
        return ['success' => false, 'error' => "cURL Error: $err"];
    }
    return ['success' => true, 'code' => $httpCode, 'response' => json_decode($response, true)];
}

$baseUrl = 'http://localhost:8000/api';

// 1. Login as Admin
echo "Logging in as Admin...\n";
$loginRes = callApi('POST', "$baseUrl/auth/admin-login", ['email' => 'admin@example.com', 'password' => 'password']);

if ($loginRes['code'] !== 200) {
    die("Login Failed: " . json_encode($loginRes) . "\n");
}

$token = $loginRes['response']['data']['token'];
echo "Login Successful.\n";

// 2. Test Module Endpoints
$endpoints = [
    'FIFA Import' => '/admin/fifa/import-dashboard-data',
    'FIFA Processing' => '/admin/fifa/processing-dashboard-data',
    'Sheriff Workflow' => '/admin/sheriff/dashboard-data',
    'Redemption' => '/admin/redemption/dashboard-data',
    'Barment' => '/admin/barment/dashboard-data',
    'Quiet Title' => '/admin/quiet-title/dashboard-data',
    'Auction' => '/admin/auction/dashboard-data',
    'REO Disposition' => '/admin/reo/dashboard-data',
    'Parcel Research' => '/admin/parcel/dashboard-data',
];

foreach ($endpoints as $name => $uri) {
    echo "Testing $name ($uri)...\n";
    $res = callApi('GET', $baseUrl . $uri, [], $token);
    echo "Status: " . $res['code'] . "\n";
    if ($res['code'] !== 200) {
        $msg = $res['response']['message'] ?? 'Unknown Error';
        echo "Error: $msg\n";
        if (isset($res['response']['exception'])) {
             echo "Exception: " . $res['response']['exception'] . "\n";
        }
    } else {
        echo "OK\n";
    }
    echo "---------------------------------------------------\n";
}
