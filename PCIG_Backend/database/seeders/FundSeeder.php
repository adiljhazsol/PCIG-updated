<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fund;
use Carbon\Carbon;

class FundSeeder extends Seeder
{
    public function run(): void
    {
        Fund::create([
            'name' => 'PCIG Tax Lien Fund I',
            'slug' => 'pcig-tax-lien-fund-i',
            'description' => 'Diversified tax lien certificate fund focusing on Arizona properties.',
            'min_investment' => 10000.00,
            'current_nav' => 2500000.00,
            'total_assets' => 2500000.00,
            'total_shares' => 25000,
            'available_shares' => 15000,
            'price_per_share' => 100.00,
            'status' => 'open',
            'launch_date' => Carbon::now()->subYear(),
        ]);
    }
}
