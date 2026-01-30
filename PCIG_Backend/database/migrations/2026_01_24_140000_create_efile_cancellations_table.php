<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('efile_cancellations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->string('filing_id')->nullable(); // External e-filing ID
            $table->string('reason');
            $table->date('requested_at');
            $table->enum('status', ['pending', 'processing', 'cancelled', 'failed'])->default('pending');
            $table->foreignId('requested_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('efile_cancellations');
    }
};
