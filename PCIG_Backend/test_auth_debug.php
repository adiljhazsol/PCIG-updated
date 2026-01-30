<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- User Role Debug ---\n";

$users = User::with('roles')->get();

foreach ($users as $user) {
    echo "User: " . $user->name . " (" . $user->email . ")\n";
    echo "  Role Type Field: " . $user->role_type . "\n";
    echo "  Roles: " . $user->getRoleNames()->implode(', ') . "\n";
    echo "-------------------------\n";
}

echo "\n--- Route/Middleware Check ---\n";
// This part is harder to script simply without booting full route service, 
// but we can rely on api.php inspection for now.
