<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('state');
            $table->string('county')->nullable();
            $table->string('city')->nullable();
            $table->json('rules')->nullable(); // JSON for specific rules
            $table->json('fees')->nullable();  // JSON for fee structures
            $table->json('contact_info')->nullable(); // JSON for local contacts
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
