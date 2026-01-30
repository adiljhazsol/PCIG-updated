<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\Depreciation;
use App\Models\User;
use Carbon\Carbon;

class DepreciationSeeder extends Seeder
{
    public function run()
    {
        $admin = User::where('role_type', 'admin')->first() ?? User::first();
        $properties = Property::all();

        if ($properties->isEmpty()) {
            $this->command->info('No properties found. Skipping depreciation seeding.');
            return;
        }

        foreach ($properties as $property) {
            // Create depreciation for last 3 years
            $years = [2023, 2024, 2025];
            $basis = $property->purchase_price > 0 ? $property->purchase_price : 100000;
            
            foreach ($years as $year) {
                // Straight line 27.5 years
                $amount = $basis / 27.5;
                
                Depreciation::firstOrCreate(
                    [
                        'property_id' => $property->id,
                        'tax_year' => $year
                    ],
                    [
                        'asset_basis' => $basis,
                        'depreciation_amount' => $amount,
                        'method' => 'straight_line',
                        'useful_life_years' => 27, // 27.5 rounded or integer field
                        'created_by' => $admin ? $admin->id : 1,
                    ]
                );
            }
        }
        
        $this->command->info('Depreciation data seeded for ' . $properties->count() . ' properties.');
    }
}
