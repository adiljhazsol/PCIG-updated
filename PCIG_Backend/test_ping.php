<?php

use Illuminate\Support\Facades\Http;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

echo "Testing Ping...\n";

$response = Http::get('http://127.0.0.1:8000/api/test-investor-ping');

echo "Status: " . $response->status() . "\n";
echo "Body: " . $response->body() . "\n";
