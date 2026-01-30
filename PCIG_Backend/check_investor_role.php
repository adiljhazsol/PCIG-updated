<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::where('email', 'investor@pcig.com')->first();

if (!$user) {
    echo "Investor user not found.\n";
    // List all users and their roles
    $users = User::all();
    foreach ($users as $u) {
        echo "User: {$u->email} (ID: {$u->id})\n";
        echo "Roles: " . $u->getRoleNames()->implode(', ') . "\n";
        echo "Role Type: " . $u->role_type . "\n";
        echo "-------------------\n";
    }
} else {
    echo "User: {$user->email} (ID: {$user->id})\n";
    echo "Roles: " . $user->getRoleNames()->implode(', ') . "\n";
    echo "Role Type: " . $user->role_type . "\n";
}
