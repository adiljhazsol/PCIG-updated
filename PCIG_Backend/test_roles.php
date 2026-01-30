<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'investor@pcig.com';
$user = User::where('email', $email)->first();

if (!$user) {
    echo "User $email not found.\n";
    exit(1);
}

echo "User: {$user->name} ({$user->id})\n";
echo "Role Type: {$user->role_type}\n";
echo "Roles: " . implode(', ', $user->getRoleNames()->toArray()) . "\n";

$isInvestor = $user->hasRole('investor');
echo "Has 'investor' role: " . ($isInvestor ? 'Yes' : 'No') . "\n";

// Check Admin
$adminEmail = 'admin@pcig.com';
$admin = User::where('email', $adminEmail)->first();
if ($admin) {
    echo "\nUser: {$admin->name} ({$admin->id})\n";
    echo "Role Type: {$admin->role_type}\n";
    echo "Roles: " . implode(', ', $admin->getRoleNames()->toArray()) . "\n";
}
