<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShareListing;
use App\Models\Property;
use App\Models\User;
use App\Models\Investment;

class ShareListingSeeder extends Seeder
{
    public function run()
    {
        // Ensure we have some properties and investors
        $properties = Property::take(5)->get();
        $investors = User::where('role_type', 'investor')->take(3)->get();
        $seller = User::where('role_type', 'investor')->first();

        if ($properties->count() > 0 && $seller) {
            foreach ($properties as $property) {
                // Ensure seller has an investment to sell
                Investment::firstOrCreate(
                    [
                        'user_id' => $seller->id,
                        'property_id' => $property->id,
                        'status' => 'active',
                    ],
                    [
                        'investment_id' => 'INV-' . strtoupper(uniqid()),
                        'name' => 'Seed Investment',
                        'type' => 'equity',
                        'shares' => 100,
                        'amount' => 5000,
                        'price_per_share' => 50,
                        'purchase_date' => now(),
                        'current_value' => 5000,
                        'interest' => 0,
                        'depreciation' => 0,
                        'returns' => 0,
                    ]
                );

                ShareListing::create([
                    'seller_id' => $seller->id,
                    'property_id' => $property->id,
                    'shares' => rand(5, 50),
                    'price_per_share' => rand(45, 60),
                    'total_price' => 0, // Will be calculated
                    'status' => 'active',
                    'notes' => 'Great investment opportunity!',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Update total_price
            $listings = ShareListing::all();
            foreach ($listings as $listing) {
                $listing->total_price = $listing->shares * $listing->price_per_share;
                $listing->save();
            }
        }
    }
}
