<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Property;

echo "User count: " . User::count() . "\n";
echo "Property count: " . Property::count() . "\n";

$admin = User::where('email', 'admin@example.com')->first();
if ($admin) {
    echo "Admin found: " . $admin->email . "\n";
} else {
    echo "Admin NOT found\n";
}
