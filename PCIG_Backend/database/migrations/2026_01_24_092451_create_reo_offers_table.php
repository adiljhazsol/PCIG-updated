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
        if (!Schema::hasTable('reo_offers')) {
            Schema::create('reo_offers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('reo_property_id')->constrained('reo_properties')->cascadeOnDelete();
                $table->decimal('offer_amount', 10, 2);
                $table->string('buyer_info');
                $table->date('offer_date')->nullable();
                $table->enum('status', ['pending', 'accepted', 'rejected', 'counter'])->default('pending')->index();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reo_offers');
    }
};
