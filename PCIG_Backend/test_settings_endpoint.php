<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
Illuminate\Support\Facades\Facade::setFacadeApplication($app);

// Find an admin user
$admin = User::role('admin')->first();

if (!$admin) {
    echo "No admin user found. Creating one...\n";
    $admin = User::create([
        'name' => 'Admin Test',
        'email' => 'admin_test_settings@example.com',
        'password' => Hash::make('password'),
        'role_type' => 'admin',
    ]);
    $admin->assignRole('admin');
}

echo "Testing /api/admin/settings/dashboard-data with user: " . $admin->email . "\n";

$request = Illuminate\Http\Request::create('/api/admin/settings/dashboard-data', 'GET');
$request->headers->set('Accept', 'application/json');
$request->headers->set('Authorization', 'Bearer ' . $admin->createToken('test')->plainTextToken);

// Dispatch the request
try {
    $response = $app->handle($request);
    echo "Status Code: " . $response->getStatusCode() . "\n";
    if ($response->getStatusCode() !== 200) {
        echo "Error Content: " . $response->getContent() . "\n";
    } else {
        echo "Success! Content Preview: " . substr($response->getContent(), 0, 200) . "...\n";
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
