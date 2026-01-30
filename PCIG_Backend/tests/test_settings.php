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

// 2. Seed Default Settings
echo "2. Seeding Default Settings...\n";
$seederContent = '<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::firstOrCreate(
            ["key" => "default_interest_rate"],
            ["value" => "5.5", "type" => "string", "description" => "Default interest rate for loans"]
        );
        Setting::firstOrCreate(
            ["key" => "maintenance_mode"],
            ["value" => "0", "type" => "boolean", "description" => "System maintenance mode"]
        );
    }
}
';
file_put_contents('database/seeders/SettingSeeder.php', $seederContent);

// Run seeder via shell command later, or assume user runs it. 
// We will rely on manual run command after this file creation.

// 3. Get Settings
echo "3. Getting Settings...\n";
$response = $client->get('admin/settings', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$settings = json_decode($response->getBody(), true);
// print_r($settings);

// 4. Update Settings
echo "4. Updating Settings...\n";
$response = $client->put('admin/settings', [
    'headers' => ['Authorization' => 'Bearer ' . $token],
    'json' => [
        'settings' => [
            ['key' => 'default_interest_rate', 'value' => '6.0']
        ]
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n";

// 5. Verify Update
echo "5. Verifying Update...\n";
$response = $client->get('admin/settings', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$settings = json_decode($response->getBody(), true);
$found = false;
foreach ($settings['data'] as $s) {
    if ($s['key'] == 'default_interest_rate' && $s['value'] == '6.0') {
        $found = true;
        break;
    }
}
echo "Update Verified: " . ($found ? "Yes" : "No") . "\n";
