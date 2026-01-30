<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking Investor User...\n";
$user = User::where('email', 'investor@pcig.com')->first();

if (!$user) {
    echo "User not found!\n";
    exit;
}

echo "User ID: " . $user->id . "\n";
echo "Roles (web): " . implode(', ', $user->getRoleNames()->toArray()) . "\n";

// Check if role exists
$role = Role::where('name', 'investor')->first();
echo "Role 'investor' exists: " . ($role ? 'Yes' : 'No') . "\n";
if ($role) {
    echo "Role Guard: " . $role->guard_name . "\n";
}

// Check if user has role for 'web' guard
echo "Has role 'investor' (web): " . ($user->hasRole('investor', 'web') ? 'Yes' : 'No') . "\n";
echo "Has role 'investor' (sanctum): " . ($user->hasRole('investor', 'sanctum') ? 'Yes' : 'No') . "\n";
echo "Has role 'investor' (api): " . ($user->hasRole('investor', 'api') ? 'Yes' : 'No') . "\n";

// Login as user
Auth::login($user);
echo "Logged in via Auth::login(). Current guard: " . Auth::getDefaultDriver() . "\n";
echo "User has role 'investor' (default guard): " . ($user->hasRole('investor') ? 'Yes' : 'No') . "\n";

echo "\nChecking Admin User...\n";
$admin = User::where('email', 'admin@pcig.com')->first();
if ($admin) {
    echo "User ID: " . $admin->id . "\n";
    echo "Roles (web): " . implode(', ', $admin->getRoleNames()->toArray()) . "\n";
    echo "Has role 'admin' (web): " . ($admin->hasRole('admin', 'web') ? 'Yes' : 'No') . "\n";
    echo "Has role 'admin' (sanctum): " . ($admin->hasRole('admin', 'sanctum') ? 'Yes' : 'No') . "\n";
} else {
    echo "Admin User not found!\n";
}

