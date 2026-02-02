<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('funds', function (Blueprint $table) {
            if (!Schema::hasColumn('funds', 'fund_code')) {
                $table->string('fund_code')->nullable()->after('name');
            }
        });

        // Generate fund codes for existing funds
        $funds = DB::table('funds')->whereNull('fund_code')->get();
        foreach ($funds as $fund) {
            $code = 'PCIG-FUND-' . str_pad($fund->id, 4, '0', STR_PAD_LEFT);
            DB::table('funds')->where('id', $fund->id)->update(['fund_code' => $code]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('funds', function (Blueprint $table) {
            if (Schema::hasColumn('funds', 'fund_code')) {
                $table->dropColumn('fund_code');
            }
        });
    }
};
