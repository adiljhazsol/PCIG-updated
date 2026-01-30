<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tax_appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->date('filed_date');
            $table->decimal('current_assessment', 15, 2)->nullable();
            $table->decimal('proposed_assessment', 15, 2)->nullable();
            $table->enum('status', ['pending', 'filed', 'in_review', 'hearing_scheduled', 'won', 'lost', 'settled'])->default('pending');
            $table->string('outcome')->nullable();
            $table->decimal('savings', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tax_appeals');
    }
};
