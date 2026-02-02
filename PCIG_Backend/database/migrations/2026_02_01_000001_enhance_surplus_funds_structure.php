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
        // 1. Add owner_phone to properties
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'owner_phone')) {
                $table->string('owner_phone')->nullable()->after('owner');
            }
        });

        // 2. Add case_number to surplus_funds
        Schema::table('surplus_funds', function (Blueprint $table) {
            if (!Schema::hasColumn('surplus_funds', 'case_number')) {
                $table->string('case_number')->nullable()->after('id');
            }
        });

        // 3. Create surplus_fund_contacts table
        if (!Schema::hasTable('surplus_fund_contacts')) {
            Schema::create('surplus_fund_contacts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('surplus_fund_id')->constrained('surplus_funds')->cascadeOnDelete();
                $table->date('contact_date');
                $table->string('type'); // call, email, letter, etc.
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->constrained('users');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surplus_fund_contacts');

        Schema::table('surplus_funds', function (Blueprint $table) {
            $table->dropColumn('case_number');
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('owner_phone');
        });
    }
};
