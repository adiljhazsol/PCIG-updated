<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notice_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('content'); // Contains placeholders like {{recipient_name}}, {{property_address}}
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('template_id')->constrained('notice_templates');
            $table->string('recipient_name');
            $table->string('recipient_address');
            $table->date('sent_date')->nullable();
            $table->enum('status', ['draft', 'generated', 'sent', 'delivered', 'failed'])->default('draft');
            $table->string('file_path')->nullable(); // Path to generated PDF
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notices');
        Schema::dropIfExists('notice_templates');
    }
};
