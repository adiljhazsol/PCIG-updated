<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exports_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // e.g., 'properties', 'investors', 'k1'
            $table->string('file_path');
            $table->foreignId('exported_by')->constrained('users');
            $table->timestamp('exported_at');
            $table->timestamps();
        });

        Schema::create('notices_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notice_id')->nullable(); // Assuming links to a 'notices' table or similar logic
            $table->string('sent_to'); // Email or Address
            $table->timestamp('sent_at');
            $table->string('status'); // 'sent', 'failed', 'delivered'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notices_logs');
        Schema::dropIfExists('exports_logs');
    }
};
