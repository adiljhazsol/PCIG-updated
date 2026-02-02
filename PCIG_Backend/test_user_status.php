<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\User;

try {
    $investor = User::role('investor')->first();
    if ($investor) {
        echo "Investor found: " . $investor->id . "\n";
        echo "Email verified at: " . ($investor->email_verified_at ?? 'NULL') . "\n";
        echo "Status: " . ($investor->email_verified_at ? 'Active' : 'Pending') . "\n";
    } else {
        echo "No investor found.\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
