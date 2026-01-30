<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_batches', function (Blueprint $table) {
            $table->id();
            $table->decimal('total_amount', 15, 2);
            $table->integer('payment_count');
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('batch_id')->nullable()->constrained('payment_batches')->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->string('type'); // distribution, refund, withdrawal
            $table->string('status')->default('pending'); // pending, completed, failed
            $table->string('payment_method')->nullable(); // ach, wire, check
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_batches');
    }
};
