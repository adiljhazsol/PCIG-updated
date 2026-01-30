<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "\n";
echo "===============================================================================================\n";
echo "                                DYNAMIC USER CREDENTIAL CHECK                                  \n";
echo "===============================================================================================\n";
echo "Database: " . DB::connection()->getDatabaseName() . "\n";
echo "Testing Password: 'password'\n";
echo "-----------------------------------------------------------------------------------------------\n";
echo sprintf("| %-5s | %-20s | %-35s | %-10s | %-15s |\n", 'ID', 'Name', 'Email', 'Role', 'Status');
echo "-----------------------------------------------------------------------------------------------\n";

$users = User::all();

if ($users->isEmpty()) {
    echo "| No users found in database.                                                                 |\n";
} else {
    foreach ($users as $user) {
        $status = Hash::check('password', $user->password) ? 'VALID' : 'INVALID';
        $role = $user->role_type ?? 'N/A';
        
        echo sprintf(
            "| %-5s | %-20s | %-35s | %-10s | %-15s |\n",
            $user->id,
            substr($user->name, 0, 20),
            substr($user->email, 0, 35),
            substr($role, 0, 10),
            $status
        );
    }
}

echo "-----------------------------------------------------------------------------------------------\n";
echo "Total Users: " . $users->count() . "\n";
echo "===============================================================================================\n\n";
