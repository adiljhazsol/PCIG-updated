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
        Schema::table('data_imports', function (Blueprint $table) {
            $table->string('name')->nullable()->after('type');
            $table->text('description')->nullable()->after('name');
        });

        Schema::table('fifa_imports', function (Blueprint $table) {
            $table->text('description')->nullable()->after('file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_imports', function (Blueprint $table) {
            $table->dropColumn(['name', 'description']);
        });

        Schema::table('fifa_imports', function (Blueprint $table) {
            $table->dropColumn(['description']);
        });
    }
};
