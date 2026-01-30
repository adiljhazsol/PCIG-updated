<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payoff_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->string('requester_name');
            $table->string('requester_email');
            $table->string('requester_phone')->nullable();
            $table->decimal('amount', 15, 2)->nullable();
            $table->enum('status', ['pending', 'processing', 'approved', 'rejected', 'completed'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('lawyer_payoff_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            // Assuming lawyers are users in the system, or just external contacts
            // For now, let's assume they are external contacts for simplicity as per plan "client_name"
            $table->string('lawyer_name');
            $table->string('lawyer_email');
            $table->string('firm_name')->nullable();
            $table->string('client_name');
            $table->decimal('amount', 15, 2)->nullable();
            $table->enum('status', ['pending', 'quote_generated', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('lawyer_payoff_requests');
        Schema::dropIfExists('payoff_requests');
    }
};
