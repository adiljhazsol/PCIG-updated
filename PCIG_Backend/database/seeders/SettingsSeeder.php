<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;
use App\Models\Location;
use App\Models\Template;

class SettingsSeeder extends Seeder
{
    public function run()
    {
        // Settings
        $settings = [
            ['key' => 'system_maintenance_mode', 'value' => '0', 'type' => 'boolean', 'description' => 'Maintenance Mode'],
            ['key' => 'interest_rate_global', 'value' => '12.5', 'type' => 'string', 'description' => 'Global Interest Rate'],
            ['key' => 'company_name', 'value' => 'PCIG', 'type' => 'string', 'description' => 'Company Name'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }

        // Locations
        $locations = [
            [
                'state' => 'Georgia',
                'county' => 'Fulton',
                'city' => 'Atlanta',
                'rules' => ['barment_period' => '365 days'],
                'fees' => ['redemption_rate' => '20%'],
                'contact_info' => ['phone' => '555-0101'],
            ],
            [
                'state' => 'Georgia',
                'county' => 'DeKalb',
                'city' => 'Decatur',
                'rules' => ['barment_period' => '365 days'],
                'fees' => ['redemption_rate' => '20%'],
                'contact_info' => ['phone' => '555-0102'],
            ],
        ];

        foreach ($locations as $location) {
            Location::firstOrCreate(['county' => $location['county'], 'state' => $location['state']], $location);
        }

        // Templates
        $templates = [
            [
                'name' => 'Standard Barment Notice',
                'type' => 'letter',
                'content' => 'Dear Owner...',
                'variables' => ['name', 'address'],
                'created_by' => 1,
            ],
            [
                'name' => 'Sheriff Sale Export',
                'type' => 'export',
                'content' => 'column1,column2',
                'variables' => [],
                'created_by' => 1,
            ],
        ];

        foreach ($templates as $template) {
            Template::firstOrCreate(['name' => $template['name']], $template);
        }
    }
}
