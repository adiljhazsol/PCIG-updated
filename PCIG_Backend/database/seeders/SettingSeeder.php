<?php

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
