<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$email = 'admin@example.com';
$password = 'password';

echo "Testing login for: $email\n";

$user = User::where('email', $email)->first();

if (!$user) {
    echo "User not found!\n";
    exit(1);
}

echo "User found. ID: " . $user->id . "\n";
echo "Role Type: " . $user->role_type . "\n";
echo "Has Admin Role: " . ($user->hasRole('admin') ? 'Yes' : 'No') . "\n";

if (Hash::check($password, $user->password)) {
    echo "Password check: SUCCESS\n";
    
    // Simulate controller logic
    $isAdmin = $user->hasRole('admin') || $user->role_type === 'admin';
    if ($isAdmin) {
        echo "Admin privileges check: SUCCESS\n";
        echo "Login should work.\n";
    } else {
        echo "Admin privileges check: FAILED\n";
    }
} else {
    echo "Password check: FAILED\n";
    echo "Stored hash: " . $user->password . "\n";
    echo "New hash of 'password': " . Hash::make('password') . "\n";
}
