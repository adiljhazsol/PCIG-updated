<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('lawyer_payoff_requests', function (Blueprint $table) {
            $table->string('lawyer_phone')->nullable()->after('lawyer_email');
            $table->string('billing_address')->nullable()->after('notes');
            $table->string('billing_city')->nullable()->after('billing_address');
            $table->string('billing_state')->nullable()->after('billing_city');
            $table->string('billing_zip')->nullable()->after('billing_state');
            $table->string('payment_method')->default('stripe')->after('billing_zip');
            $table->string('payment_status')->default('pending')->after('payment_method');
            $table->string('transaction_id')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lawyer_payoff_requests', function (Blueprint $table) {
            $table->dropColumn([
                'lawyer_phone',
                'billing_address',
                'billing_city',
                'billing_state',
                'billing_zip',
                'payment_method',
                'payment_status',
                'transaction_id'
            ]);
        });
    }
};
