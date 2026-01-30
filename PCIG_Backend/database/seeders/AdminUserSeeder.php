<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Fix admin@pcig.com
        $admin1 = User::updateOrCreate(
            ['email' => 'admin@pcig.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role_type' => 'admin',
            ]
        );
        if (!$admin1->hasRole('admin')) {
            $admin1->assignRole($adminRole);
        }

        // Fix admin@example.com (User preference)
        $admin2 = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Example',
                'password' => Hash::make('password'),
                'role_type' => 'admin',
            ]
        );
        if (!$admin2->hasRole('admin')) {
            $admin2->assignRole($adminRole);
        }
        
        $this->command->info('Admin users updated:');
        $this->command->info('- admin@pcig.com / password');
        $this->command->info('- admin@example.com / password');
    }
}
