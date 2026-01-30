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
        Schema::create('fifa_import_errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_id')->constrained('fifa_imports')->cascadeOnDelete();
            $table->integer('row_number');
            $table->text('error_message');
            $table->json('row_data')->nullable();
            $table->timestamps();
            
            $table->index(['import_id', 'row_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fifa_import_errors');
    }
};
