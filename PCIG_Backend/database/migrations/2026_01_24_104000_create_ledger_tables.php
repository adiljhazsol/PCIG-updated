<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('type', ['asset', 'liability', 'equity', 'revenue', 'expense']);
            $table->decimal('balance', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->string('description')->nullable();
            $table->date('entry_date');
            $table->timestamps();
        });

        // Seed default accounts
        DB::table('accounts')->insert([
            ['code' => '1000', 'name' => 'Cash', 'type' => 'asset', 'created_at' => now(), 'updated_at' => now()],
            ['code' => '1100', 'name' => 'Accounts Receivable', 'type' => 'asset', 'created_at' => now(), 'updated_at' => now()],
            ['code' => '2000', 'name' => 'Accounts Payable', 'type' => 'liability', 'created_at' => now(), 'updated_at' => now()],
            ['code' => '3000', 'name' => 'Owner Equity', 'type' => 'equity', 'created_at' => now(), 'updated_at' => now()],
            ['code' => '4000', 'name' => 'Sales Revenue', 'type' => 'revenue', 'created_at' => now(), 'updated_at' => now()],
            ['code' => '5000', 'name' => 'General Expenses', 'type' => 'expense', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('ledger_entries');
        Schema::dropIfExists('accounts');
    }
};
