<?php

require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client([
    'base_uri' => 'http://127.0.0.1:8000/api/',
    'http_errors' => false
]);

// 1. Login as Admin
echo "1. Logging in as Admin...\n";
$response = $client->post('auth/admin-login', [
    'json' => [
        'email' => 'admin@pcig.com',
        'password' => 'password'
    ]
]);
$login = json_decode($response->getBody(), true);
if (!isset($login['data']['token'])) {
    echo "Login Failed: " . $response->getBody() . "\n";
    exit;
}
$token = $login['data']['token'];
echo "Token: " . substr($token, 0, 20) . "...\n\n";

// 2. Seed Audit Log Entry
// Since we don't have a direct endpoint to create logs (it's usually automatic),
// we will manually insert one via a seeder or just assume one exists if we run this after other tests?
// Or better, create a seeder for this test.
echo "2. Seeding Audit Log...\n";
// Let's create a seeder file for ActivityLog
$seederContent = '<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        ActivityLog::create([
            "log_name" => "default",
            "description" => "User logged in",
            "causer_type" => User::class,
            "causer_id" => $user ? $user->id : 1,
            "properties" => ["ip" => "127.0.0.1"]
        ]);
    }
}
';
file_put_contents('database/seeders/ActivityLogSeeder.php', $seederContent);

// Run seeder
// We'll run this via shell command after creating the file.

// 3. List Audit Logs
echo "3. Listing Audit Logs...\n";
$response = $client->get('admin/audit-log', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$logs = json_decode($response->getBody(), true);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Log Count: " . count($logs['data']) . "\n";
