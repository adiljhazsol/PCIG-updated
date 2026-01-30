<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Property;
class BarmentTestSeeder extends Seeder {
    public function run() {
        if (!Property::where('address', 'Barment Test St')->exists()) {
            Property::create([
                'address' => 'Barment Test St',
                'city' => 'Test City',
                'state' => 'GA',
                'zip_code' => '12345',
                'status' => 'active',
                'workflow_stage' => 'redemption',
                'purchase_price' => 100000,
                'parcel_id' => 'BARMENT-' . time(),
            ]);
        }
    }
}