<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('reports')) {
            Schema::create('reports', function (Blueprint $table) {
                $table->id();
                $table->string('type'); // e.g., 'financial_summary', 'investor_activity', 'property_performance'
                $table->json('parameters')->nullable(); // e.g., {"start_date": "2024-01-01", "end_date": "2024-12-31"}
                $table->string('file_path')->nullable();
                $table->foreignId('generated_by')->constrained('users');
                $table->timestamp('generated_at')->useCurrent();
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
