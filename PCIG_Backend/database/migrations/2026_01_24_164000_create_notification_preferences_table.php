<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('channel'); // email, sms, in_app
            $table->string('type'); // e.g., 'deadline', 'payment', 'system'
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            
            // Unique constraint to prevent duplicate settings for same user/channel/type
            $table->unique(['user_id', 'channel', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
