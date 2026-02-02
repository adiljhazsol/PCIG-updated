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
        if (!Schema::hasTable('auctions')) {
            Schema::create('auctions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('property_id')->constrained()->cascadeOnDelete();
                $table->dateTime('auction_date')->nullable();
                $table->string('location')->nullable();
                $table->decimal('starting_bid', 10, 2)->nullable();
                $table->decimal('winning_bid', 10, 2)->nullable();
                $table->text('winner_info')->nullable();
                $table->enum('status', ['scheduled', 'completed', 'cancelled', 'failed'])->default('scheduled')->index();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['property_id', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};
