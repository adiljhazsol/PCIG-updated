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
        if (!Schema::hasTable('reo_properties')) {
            Schema::create('reo_properties', function (Blueprint $table) {
                $table->id();
                $table->foreignId('property_id')->constrained()->cascadeOnDelete();
                $table->date('acquisition_date')->nullable();
                $table->enum('disposition_strategy', ['sale', 'lease', 'hold'])->default('sale')->index();
                $table->decimal('listed_price', 10, 2)->nullable();
                $table->enum('status', ['marketing', 'offer_accepted', 'sold', 'leased'])->default('marketing')->index();
                $table->string('listing_agent')->nullable();
                $table->date('listing_date')->nullable();
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
        Schema::dropIfExists('reo_properties');
    }
};
