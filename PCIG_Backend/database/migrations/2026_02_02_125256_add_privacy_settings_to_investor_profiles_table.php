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
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->json('privacy_settings')->nullable()->after('is_accredited');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->dropColumn('privacy_settings');
        });
    }
};
