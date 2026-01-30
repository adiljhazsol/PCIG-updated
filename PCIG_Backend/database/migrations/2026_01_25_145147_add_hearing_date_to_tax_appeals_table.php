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
        Schema::table('tax_appeals', function (Blueprint $table) {
            $table->date('hearing_date')->nullable()->after('filed_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tax_appeals', function (Blueprint $table) {
            $table->dropColumn('hearing_date');
        });
    }
};
