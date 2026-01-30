<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class InvestorUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure Investor Role Exists
        $investorRole = Role::firstOrCreate(['name' => 'investor']);

        // Create or Update Investor User
        $investor = User::firstOrCreate(
            ['email' => 'investor@pcig.com'],
            [
                'name' => 'Investor User',
                'password' => Hash::make('password'),
                'role_type' => 'investor',
            ]
        );

        // Assign Role
        if (!$investor->hasRole('investor')) {
            $investor->assignRole($investorRole);
            $this->command->info('Assigned investor role to investor@pcig.com');
        } else {
            $this->command->info('investor@pcig.com already has investor role');
        }

        // Ensure role_type is set (in case user existed but role_type was missing)
        if ($investor->role_type !== 'investor') {
            $investor->role_type = 'investor';
            $investor->save();
        }
    }
}
