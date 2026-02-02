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
            if (!Schema::hasColumn('funds', 'strategy')) {
                $table->string('strategy')->nullable()->after('status');
            }
            if (!Schema::hasColumn('funds', 'target_irr')) {
                $table->string('target_irr')->nullable()->after('strategy');
            }
            if (!Schema::hasColumn('funds', 'lock_up_period')) {
                $table->string('lock_up_period')->nullable()->after('target_irr');
            }
            if (!Schema::hasColumn('funds', 'performance_metric')) {
                $table->decimal('performance_metric', 5, 2)->nullable()->after('lock_up_period'); // e.g. 14.20
            }
            if (!Schema::hasColumn('funds', 'management_fee')) {
                $table->decimal('management_fee', 4, 2)->nullable()->after('performance_metric'); // e.g. 2.00
            }
            if (!Schema::hasColumn('funds', 'cap')) {
                $table->decimal('cap', 15, 2)->nullable()->after('total_assets');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('funds', function (Blueprint $table) {
            $table->dropColumn(['strategy', 'target_irr', 'lock_up_period', 'performance_metric', 'management_fee', 'cap']);
        });
    }
};
