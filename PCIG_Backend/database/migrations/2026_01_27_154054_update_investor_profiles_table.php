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
            if (!Schema::hasColumn('investor_profiles', 'is_accredited')) {
                $table->boolean('is_accredited')->default(false)->after('user_id');
            }
            if (!Schema::hasColumn('investor_profiles', 'dob')) {
                $table->date('dob')->nullable()->after('is_accredited');
            }
            if (!Schema::hasColumn('investor_profiles', 'citizenship')) {
                $table->string('citizenship')->nullable()->after('dob');
            }
            if (!Schema::hasColumn('investor_profiles', 'employment_status')) {
                $table->string('employment_status')->nullable()->after('citizenship');
            }
            if (!Schema::hasColumn('investor_profiles', 'annual_income')) {
                $table->string('annual_income')->nullable()->after('employment_status');
            }
            if (!Schema::hasColumn('investor_profiles', 'source_of_funds')) {
                $table->string('source_of_funds')->nullable()->after('annual_income');
            }
            if (!Schema::hasColumn('investor_profiles', 'routing_number')) {
                $table->string('routing_number')->nullable()->after('source_of_funds');
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
                'is_accredited',
                'dob',
                'citizenship',
                'employment_status',
                'annual_income',
                'source_of_funds',
                'routing_number'
            ]);
        });
    }
};
