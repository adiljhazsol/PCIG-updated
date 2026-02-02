<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('deadlines')) {
            Schema::create('deadlines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('property_id')->nullable()->constrained('properties');
                $table->string('type'); // e.g., 'tax_appeal', 'redemption', 'filing'
                $table->date('deadline_date');
                $table->string('description')->nullable();
                $table->enum('status', ['pending', 'completed', 'overdue'])->default('pending');
                $table->timestamp('notified_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('deadlines');
    }
};
