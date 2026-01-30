<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to modify column type to ensure it works without doctrine/dbal
        // We assume data has already been cleaned by fix_funds_force.php
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE funds MODIFY min_investment DECIMAL(15,2) NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE funds MODIFY min_investment VARCHAR(255) NULL");
        }
    }
};
