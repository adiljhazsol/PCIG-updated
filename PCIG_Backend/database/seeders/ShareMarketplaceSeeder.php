<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Property;
use App\Models\Investment;
use App\Models\ShareListing;
use App\Models\ShareTransaction;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class ShareMarketplaceSeeder extends Seeder
{
    public function run()
    {
        // Ensure we have users
        $admin = User::firstOrCreate(
            ['email' => 'admin@pcig.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role_type' => 'admin',
            ]
        );
        
        $investor = User::firstOrCreate(
            ['email' => 'investor@pcig.com'],
            [
                'name' => 'Investor User',
                'password' => Hash::make('password'),
                'role_type' => 'investor',
            ]
        );

        // Create a secondary investor for trading
        $investor2 = User::firstOrCreate(
            ['email' => 'investor2@pcig.com'],
            [
                'name' => 'Jane Doe Investor',
                'password' => Hash::make('password'),
                'role_type' => 'investor',
            ]
        );
        $role = Role::firstOrCreate(['name' => 'investor']);
        if (!$investor2->hasRole('investor')) {
            $investor2->assignRole($role);
        }

        // Ensure we have properties
        $properties = Property::all();
        if ($properties->isEmpty()) {
            $properties = Property::factory()->count(5)->create();
        }

        // Give investors some initial investments
        foreach ($properties as $property) {
            // Admin/Sponsor holds some shares
            Investment::firstOrCreate(
                [
                    'user_id' => $admin->id,
                    'property_id' => $property->id,
                ],
                [
                    'investment_id' => 'INV-' . Str::random(8),
                    'name' => $property->address ?? 'Investment Property',
                    'type' => 'Equity',
                    'details' => 'Sponsor Investment',
                    'shares' => 1000,
                    'amount' => 100000,
                    'price_per_share' => 100,
                    'purchase_date' => now()->subMonths(6),
                    'status' => 'active',
                    'current_value' => 100000,
                ]
            );

            // Investor 2 holds some shares
            Investment::firstOrCreate(
                [
                    'user_id' => $investor2->id,
                    'property_id' => $property->id,
                ],
                [
                    'investment_id' => 'INV-' . Str::random(8),
                    'name' => $property->address ?? 'Investment Property',
                    'type' => 'Equity',
                    'details' => 'Initial Investment',
                    'shares' => 500,
                    'amount' => 50000,
                    'price_per_share' => 100,
                    'purchase_date' => now()->subMonths(5),
                    'status' => 'active',
                    'current_value' => 50000,
                ]
            );
        }

        // Create Active Listings (from Investor 2)
        foreach ($properties->take(3) as $property) {
            ShareListing::create([
                'seller_id' => $investor2->id,
                'property_id' => $property->id,
                'shares' => 50,
                'price_per_share' => 110.00, // Premium
                'total_price' => 5500.00,
                'status' => 'active',
                'notes' => 'Great investment opportunity!',
            ]);
        }

        // Create Sold Listings (History)
        $soldListing = ShareListing::create([
            'seller_id' => $investor2->id,
            'property_id' => $properties->first()->id,
            'shares' => 20,
            'price_per_share' => 105.00,
            'total_price' => 2100.00,
            'status' => 'sold',
        ]);

        ShareTransaction::create([
            'listing_id' => $soldListing->id,
            'buyer_id' => $investor->id,
            'seller_id' => $investor2->id,
            'shares' => 20,
            'total_price' => 2100.00,
            'transaction_date' => now()->subDays(5),
            'status' => 'completed',
        ]);
        
        // Give the main investor some investments (result of the trade above + others)
        Investment::firstOrCreate(
            [
                'user_id' => $investor->id,
                'property_id' => $properties->first()->id,
            ],
            [
                'investment_id' => 'INV-' . Str::random(8),
                'name' => $properties->first()->address ?? 'Investment Property',
                'type' => 'Equity',
                'details' => 'Marketplace Purchase',
                'shares' => 20,
                'amount' => 2100,
                'price_per_share' => 105,
                'purchase_date' => now()->subDays(5),
                'status' => 'active',
                'current_value' => 2100,
            ]
        );
    }
}
