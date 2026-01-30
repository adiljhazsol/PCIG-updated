<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiet_title_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->date('filed_date')->nullable();
            $table->enum('status', ['pending', 'filed', 'in_court', 'decided', 'dismissed'])->default('pending')->index();
            $table->date('court_date')->nullable();
            $table->string('court_outcome')->nullable();
            $table->foreignId('attorney_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('filing_fee', 8, 2)->nullable();
            $table->text('title_issues')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['property_id', 'status']);
            $table->index('court_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiet_title_cases');
    }
};
