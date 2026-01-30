<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        ActivityLog::create([
            "log_name" => "default",
            "description" => "User logged in",
            "causer_type" => User::class,
            "causer_id" => $user ? $user->id : 1,
            "properties" => ["ip" => "127.0.0.1"]
        ]);
    }
}
