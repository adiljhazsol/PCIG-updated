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
        Schema::table('funds', function (Blueprint $table) {
            if (!Schema::hasColumn('funds', 'performance_fee')) {
                $table->decimal('performance_fee', 5, 2)->nullable()->after('management_fee'); // e.g. 20.00
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('funds', function (Blueprint $table) {
            $table->dropColumn('performance_fee');
        });
    }
};
