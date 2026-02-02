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
        Schema::table('efile_cancellations', function (Blueprint $table) {
            $table->string('gsccca_status')->default('pending')->after('status'); // pending, ready_to_file, submitted, accepted, rejected
            $table->string('gsccca_transaction_id')->nullable()->after('gsccca_status');
            $table->timestamp('submitted_at')->nullable()->after('gsccca_transaction_id');
            $table->text('xml_content')->nullable()->after('submitted_at'); // Store generated XML or path
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('efile_cancellations', function (Blueprint $table) {
            $table->dropColumn(['gsccca_status', 'gsccca_transaction_id', 'submitted_at', 'xml_content']);
        });
    }
};
