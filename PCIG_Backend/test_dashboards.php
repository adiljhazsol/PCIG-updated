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

echo "--- Testing Admin Dashboard ---\n";
// 1. Admin Login
$loginRes = callApi('POST', "$baseUrl/auth/admin-login", ['email' => 'admin@example.com', 'password' => 'password']);
if ($loginRes['code'] == 200) {
    $token = $loginRes['response']['data']['token'];
    echo "Login Successful. Token obtained.\n";
    
    // 2. Fetch Dashboard
    $dashRes = callApi('GET', "$baseUrl/admin/dashboard", [], $token);
    echo "Dashboard Status: " . $dashRes['code'] . "\n";
    if ($dashRes['code'] == 200) {
        echo "Dashboard Data: OK\n";
    } else {
        $msg = $dashRes['response']['message'] ?? 'Unknown error';
        echo "Dashboard Failed: $msg\n";
    }
} else {
    echo "Admin Login Failed: " . json_encode($loginRes) . "\n";
}

echo "\n--- Testing Investor Dashboard ---\n";
// 3. Investor Login
$invLoginRes = callApi('POST', "$baseUrl/auth/login", ['email' => 'investor@pcig.com', 'password' => 'password']);
if ($invLoginRes['code'] == 200) {
    $token = $invLoginRes['response']['data']['token'];
    echo "Login Successful. Token obtained.\n";
    
    // 4. Fetch Dashboard
    $dashRes = callApi('GET', "$baseUrl/investor/dashboard", [], $token);
    echo "Dashboard Status: " . $dashRes['code'] . "\n";
    if ($dashRes['code'] == 200) {
        echo "Dashboard Data: OK\n";
    } else {
        $msg = $dashRes['response']['message'] ?? 'Unknown error';
        echo "Dashboard Failed: $msg\n";
    }
} else {
    echo "Investor Login Failed: " . json_encode($invLoginRes) . "\n";
}
