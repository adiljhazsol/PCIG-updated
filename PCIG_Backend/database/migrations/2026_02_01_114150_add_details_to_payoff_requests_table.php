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
        Schema::table('payoff_requests', function (Blueprint $table) {
            $table->string('relationship')->nullable()->after('property_id');
            $table->string('mailing_address')->nullable()->after('requester_phone');
            $table->string('city')->nullable()->after('mailing_address');
            $table->string('state')->nullable()->after('city');
            $table->string('zip')->nullable()->after('state');
            $table->text('additional_notes')->nullable()->after('amount');
            $table->string('id_file_path')->nullable()->after('additional_notes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('payoff_requests', function (Blueprint $table) {
            $table->dropColumn([
                'relationship',
                'mailing_address',
                'city',
                'state',
                'zip',
                'additional_notes',
                'id_file_path'
            ]);
        });
    }
};
