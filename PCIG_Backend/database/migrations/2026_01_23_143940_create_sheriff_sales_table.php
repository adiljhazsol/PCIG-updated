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
        Schema::create('sheriff_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->date('sale_date')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'postponed'])->default('scheduled')->index();
            $table->decimal('winning_bid', 15, 2)->nullable();
            $table->string('winner_info')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['property_id', 'status']);
            $table->index('sale_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sheriff_sales');
    }
};
