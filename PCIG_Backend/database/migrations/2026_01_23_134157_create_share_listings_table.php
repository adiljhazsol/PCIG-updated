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
        Schema::create('share_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->integer('shares')->default(0);
            $table->decimal('price_per_share', 10, 2);
            $table->decimal('total_price', 15, 2);
            $table->enum('status', ['active', 'pending', 'sold', 'cancelled'])->default('active')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['seller_id', 'status']);
            $table->index(['property_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('share_listings');
    }
};
