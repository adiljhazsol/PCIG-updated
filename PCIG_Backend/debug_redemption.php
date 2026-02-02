<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// We need to simulate the request to the specific controller method manually 
// because full request dispatching might require more setup (db connection etc handled by kernel)
// simpler: just instantiate the controller and call the method if we can boot the app.

$app->boot();

try {
    $controller = new \App\Http\Controllers\Api\Admin\AdminRedemptionController();
    $response = $controller->dashboardData(new \Illuminate\Http\Request());
    echo "Status: " . $response->status() . "\n";
    echo $response->content();
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo $e->getTraceAsString();
}
