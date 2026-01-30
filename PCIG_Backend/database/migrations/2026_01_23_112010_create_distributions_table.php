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
        Schema::create('distributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fund_investment_id')->nullable()->constrained('fund_investments')->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fund_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->date('distribution_date');
            $table->enum('status', ['pending', 'processed', 'failed'])->default('pending')->index();
            $table->string('description')->nullable();
            $table->string('reference_number')->nullable()->unique();
            $table->timestamps();

            $table->index(['user_id', 'distribution_date']);
            $table->index(['status', 'distribution_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distributions');
    }
};
