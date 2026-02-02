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
        // Step 1: Rename column if needed
        if (Schema::hasColumn('transactions', 'transaction_code') && !Schema::hasColumn('transactions', 'reference_number')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->renameColumn('transaction_code', 'reference_number');
            });
        }

        // Step 2: Add missing columns
        Schema::table('transactions', function (Blueprint $table) {
            // Add reference_number if it doesn't exist (and wasn't just renamed)
            if (!Schema::hasColumn('transactions', 'reference_number')) {
                 $table->string('reference_number')->unique()->nullable();
            }

            if (!Schema::hasColumn('transactions', 'property_id')) {
                $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            }
            
            if (!Schema::hasColumn('transactions', 'fund_id')) {
                $table->foreignId('fund_id')->nullable()->constrained('funds')->nullOnDelete();
            }
            
            if (!Schema::hasColumn('transactions', 'investment_id')) {
                $table->foreignId('investment_id')->nullable()->constrained('investments')->nullOnDelete();
            }

            if (!Schema::hasColumn('transactions', 'metadata')) {
                $table->json('metadata')->nullable();
            }
        });

        // Step 3: Modify user_id
        Schema::table('transactions', function (Blueprint $table) {
             $table->unsignedBigInteger('user_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['property_id']);
            $table->dropForeign(['fund_id']);
            $table->dropForeign(['investment_id']);
            
            $table->dropColumn(['property_id', 'fund_id', 'investment_id', 'metadata']);
            
            if (Schema::hasColumn('transactions', 'reference_number')) {
                $table->renameColumn('reference_number', 'transaction_code');
            }
        });
    }
};
