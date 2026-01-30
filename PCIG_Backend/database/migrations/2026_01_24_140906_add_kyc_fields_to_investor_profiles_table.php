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
            $table->date('dob')->nullable();
            $table->string('citizenship')->nullable();
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_state')->nullable();
            $table->string('address_zip')->nullable();
            $table->string('address_country')->default('United States');
            $table->string('employment_status')->nullable();
            $table->string('annual_income')->nullable();
            $table->string('source_of_funds')->nullable();
            $table->string('routing_number')->nullable();
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
