<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('investor_profiles', 'dob')) {
                $table->date('dob')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'citizenship')) {
                $table->string('citizenship')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'address_street')) {
                $table->string('address_street')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'address_city')) {
                $table->string('address_city')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'address_state')) {
                $table->string('address_state')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'address_zip')) {
                $table->string('address_zip')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'address_country')) {
                $table->string('address_country')->default('United States');
            }
            if (!Schema::hasColumn('investor_profiles', 'employment_status')) {
                $table->string('employment_status')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'annual_income')) {
                $table->string('annual_income')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'source_of_funds')) {
                $table->string('source_of_funds')->nullable();
            }
            if (!Schema::hasColumn('investor_profiles', 'routing_number')) {
                $table->string('routing_number')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'dob', 'citizenship', 
                'address_street', 'address_city', 'address_state', 'address_zip', 'address_country',
                'employment_status', 'annual_income', 'source_of_funds', 'routing_number'
            ]);
        });
    }
};
