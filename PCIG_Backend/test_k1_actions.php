<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Fund;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\Admin\AdminK1Controller;
use Illuminate\Http\Request;

// Bind a default request to avoid SessionGuard error
$app->instance('request', Request::create('/'));

// 1. Login as Admin
echo "Logging in as admin...\n";
$admin = User::where('email', 'admin@example.com')->first();
if (!$admin) {
    die("Admin user not found.\n");
}
Auth::login($admin);
echo "Logged in as: " . Auth::user()->name . "\n";

// 2. Setup Test Data
$fund = Fund::first();
if (!$fund) {
    die("No fund found for testing.\n");
}
echo "Using Fund: " . $fund->name . " (ID: " . $fund->id . ")\n";

// 3. Test Generation
echo "\n--- Testing K1 Generation ---\n";
$controller = new AdminK1Controller();

$request = Request::create('/api/admin/k1/generate', 'POST', [
    'fund_id' => $fund->id,
    'tax_year' => date('Y'),
    'scope' => 'fund'
]);
$request->setUserResolver(function () use ($admin) {
    return $admin;
});

try {
    $response = $controller->generate($request);
    $data = $response->getData(true);
    
    if (isset($data['count'])) {
        echo "Generation Successful: " . $data['message'] . "\n";
        echo "Generated " . $data['count'] . " forms.\n";
    } else {
        echo "Generation response unexpected: " . json_encode($data) . "\n";
    }
} catch (\Exception $e) {
    echo "Exception during generation: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

// 4. Test View (List)
echo "\n--- Testing K1 Listing ---\n";
$request = Request::create('/api/admin/k1/forms', 'GET', ['fund_id' => $fund->id]);
$response = $controller->index($request);
$forms = $response->getData(true)['data'];
echo "Found " . count($forms) . " K1 forms.\n";

if (count($forms) > 0) {
    $firstFormId = $forms[0]['id'];
    
    // 5. Test Download/View Single
    echo "\n--- Testing Single View (ID: $firstFormId) ---\n";
    try {
        // Note: View returns a stream or download, so we just check if it throws
        $viewResponse = $controller->view($firstFormId);
        echo "View endpoint returned status: " . $viewResponse->getStatusCode() . "\n";
    } catch (\Exception $e) {
        echo "View failed: " . $e->getMessage() . "\n";
    }
}
