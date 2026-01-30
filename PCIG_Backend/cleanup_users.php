<?php

use App\Models\User;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Cleaning Duplicate Users ---\n";

// Delete users without roles if they are duplicates
$users = User::all();
$names = [];

foreach ($users as $user) {
    if (!$user->hasAnyRole(User::first()->getRoleNames())) { // Simplification, just check if has roles
        // Actually, let's be specific based on previous output
        if ($user->email === 'investor@example.com' || $user->email === 'admin@pcig.com') {
             echo "Deleting duplicate/invalid user: " . $user->name . " (" . $user->email . ")\n";
             $user->delete();
        }
    }
}

echo "Done.\n";
