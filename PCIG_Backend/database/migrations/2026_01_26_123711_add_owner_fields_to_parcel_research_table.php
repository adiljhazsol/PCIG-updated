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
        Schema::table('parcel_research', function (Blueprint $table) {
            if (!Schema::hasColumn('parcel_research', 'owner_name')) {
                $table->string('owner_name')->nullable();
            }
            if (!Schema::hasColumn('parcel_research', 'owner_phone')) {
                $table->string('owner_phone')->nullable();
            }
            if (!Schema::hasColumn('parcel_research', 'owner_email')) {
                $table->string('owner_email')->nullable();
            }
            if (!Schema::hasColumn('parcel_research', 'mailing_address')) {
                $table->string('mailing_address')->nullable();
            }
            if (!Schema::hasColumn('parcel_research', 'status')) {
                $table->string('status')->default('New'); // Adding status here too as it was missing
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parcel_research', function (Blueprint $table) {
            $table->dropColumn(['owner_name', 'owner_phone', 'owner_email', 'mailing_address', 'status']);
        });
    }
};
