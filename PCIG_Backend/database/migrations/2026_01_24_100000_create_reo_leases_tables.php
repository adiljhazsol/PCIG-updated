<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('reo_leases')) {
            Schema::create('reo_leases', function (Blueprint $table) {
                $table->id();
                $table->foreignId('property_id')->constrained()->cascadeOnDelete();
                $table->string('tenant_name');
                $table->decimal('monthly_rent', 10, 2);
                $table->decimal('security_deposit', 10, 2)->nullable();
                $table->date('lease_start');
                $table->date('lease_end');
                $table->enum('status', ['active', 'terminated', 'expired'])->default('active');
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (!Schema::hasTable('rent_payments')) {
            Schema::create('rent_payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lease_id')->constrained('reo_leases')->cascadeOnDelete();
                $table->decimal('amount', 10, 2);
                $table->date('due_date');
                $table->date('paid_date')->nullable();
                $table->enum('status', ['paid', 'pending', 'late', 'partial'])->default('pending');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rent_payments');
        Schema::dropIfExists('reo_leases');
    }
};
