<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Standard Laravel Notifications Table
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }

        // Escalation Rules Table
        if (!Schema::hasTable('escalation_rules')) {
            Schema::create('escalation_rules', function (Blueprint $table) {
                $table->id();
                $table->string('trigger_type'); // e.g., 'deadline_overdue', 'task_stalled'
                $table->integer('delay_hours')->default(24);
                $table->foreignId('escalate_to_user_id')->constrained('users');
                $table->string('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('escalation_rules');
        Schema::dropIfExists('notifications');
    }
};
