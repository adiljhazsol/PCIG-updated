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
        Schema::table('properties', function (Blueprint $table) {
            $table->text('legal_description')->nullable()->after('description');
            $table->string('zoning')->nullable()->after('legal_description');
            $table->string('lot_size')->nullable()->after('zoning');
            $table->string('year_built')->nullable()->after('lot_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['legal_description', 'zoning', 'lot_size', 'year_built']);
        });
    }
};
