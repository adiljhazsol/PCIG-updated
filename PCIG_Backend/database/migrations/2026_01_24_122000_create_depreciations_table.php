<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depreciations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->integer('tax_year');
            $table->decimal('asset_basis', 15, 2);
            $table->decimal('depreciation_amount', 15, 2);
            $table->enum('method', ['straight_line', 'double_declining', 'sum_of_years'])->default('straight_line');
            $table->integer('useful_life_years');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depreciations');
    }
};
