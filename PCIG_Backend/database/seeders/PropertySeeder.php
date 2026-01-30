<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use Carbon\Carbon;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $properties = [
            [
                'parcel_id' => 'PARCEL-001',
                'address' => '123 Main Street',
                'city' => 'Phoenix',
                'county' => 'Maricopa',
                'state' => 'AZ',
                'zip_code' => '85001',
                'status' => 'active',
                'workflow_stage' => 'redemption',
                'purchase_price' => 50000.00,
                'current_value' => 55000.00,
                'roi' => 10.00,
                'total_shares' => 1000,
                'available_shares' => 750,
                'price_per_share' => 50.00,
                'purchase_date' => Carbon::now()->subMonths(6),
            ],
            [
                'parcel_id' => 'PARCEL-002',
                'address' => '456 Oak Avenue',
                'city' => 'Tucson',
                'county' => 'Pima',
                'state' => 'AZ',
                'zip_code' => '85701',
                'status' => 'active',
                'workflow_stage' => 'fifa_processing',
                'purchase_price' => 75000.00,
                'current_value' => 80000.00,
                'roi' => 6.67,
                'total_shares' => 1500,
                'available_shares' => 1500,
                'price_per_share' => 50.00,
                'purchase_date' => Carbon::now()->subMonths(3),
            ],
        ];

        foreach ($properties as $property) {
            Property::create($property);
        }
    }
}
