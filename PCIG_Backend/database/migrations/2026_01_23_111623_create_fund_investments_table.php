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
        Schema::create('fund_investments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fund_id')->constrained()->cascadeOnDelete();
            $table->integer('shares')->default(0);
            $table->decimal('amount', 15, 2);
            $table->decimal('price_per_share', 10, 2);
            $table->date('purchase_date');
            $table->enum('status', ['active', 'redeemed'])->default('active')->index();
            $table->timestamps();

            $table->index(['user_id', 'fund_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fund_investments');
    }
};
