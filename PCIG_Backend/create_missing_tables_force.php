<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

echo "Creating missing tables...\n";

// 1. fund_investments
if (!Schema::hasTable('fund_investments')) {
    echo "Creating 'fund_investments'...\n";
    Schema::create('fund_investments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('fund_id')->constrained()->cascadeOnDelete();
        $table->integer('shares')->default(0);
        $table->decimal('amount', 15, 2);
        $table->decimal('price_per_share', 10, 2);
        $table->date('purchase_date');
        $table->enum('status', ['active', 'redeemed'])->default('active')->index();
        $table->timestamps();

        $table->index(['user_id', 'fund_id']);
    });
    echo "Created 'fund_investments'.\n";
} else {
    echo "'fund_investments' already exists.\n";
}

// 2. distributions (depends on fund_investments)
if (!Schema::hasTable('distributions')) {
    echo "Creating 'distributions'...\n";
    Schema::create('distributions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('investment_id')->nullable()->constrained()->nullOnDelete();
        // Check if fund_investments exists before constraining? We just created it.
        $table->foreignId('fund_investment_id')->nullable()->constrained('fund_investments')->nullOnDelete();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
        $table->foreignId('fund_id')->nullable()->constrained()->nullOnDelete();
        $table->decimal('amount', 15, 2);
        $table->date('distribution_date');
        $table->enum('status', ['pending', 'processed', 'failed'])->default('pending')->index();
        $table->string('description')->nullable();
        $table->string('reference_number')->nullable()->unique();
        $table->timestamps();

        $table->index(['user_id', 'distribution_date']);
        $table->index(['status', 'distribution_date']);
    });
    echo "Created 'distributions'.\n";
} else {
    echo "'distributions' already exists.\n";
}

// 3. deadlines
if (!Schema::hasTable('deadlines')) {
    echo "Creating 'deadlines'...\n";
    Schema::create('deadlines', function (Blueprint $table) {
        $table->id();
        $table->foreignId('property_id')->nullable()->constrained('properties');
        $table->string('type'); // e.g., 'tax_appeal', 'redemption', 'filing'
        $table->date('deadline_date');
        $table->string('description')->nullable();
        $table->enum('status', ['pending', 'completed', 'overdue'])->default('pending');
        $table->timestamp('notified_at')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });
    echo "Created 'deadlines'.\n";
} else {
    echo "'deadlines' already exists.\n";
}

// 4. redemption_trackings (Note: migration said 'redemption_trackings' plural, verify controller usage)
// Controller uses `RedemptionTracking` model. By default model `RedemptionTracking` -> table `redemption_trackings`.
// Let's verify the migration file name again: 2026_01_23_144255_create_redemption_trackings_table.php
// And the Schema::create calls 'redemption_trackings'.
if (!Schema::hasTable('redemption_trackings')) {
    echo "Creating 'redemption_trackings'...\n";
    Schema::create('redemption_trackings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('property_id')->constrained()->cascadeOnDelete();
        $table->date('redemption_deadline');
        $table->enum('status', ['pending', 'redeemed', 'expired'])->default('pending')->index();
        $table->date('redeemed_at')->nullable();
        $table->decimal('redemption_amount', 15, 2)->nullable();
        $table->text('notes')->nullable();
        $table->timestamps();
        
        $table->index(['property_id', 'status']);
        $table->index('redemption_deadline');
    });
    echo "Created 'redemption_trackings'.\n";
} else {
    echo "'redemption_trackings' already exists.\n";
}

// 5. reports
if (!Schema::hasTable('reports')) {
    echo "Creating 'reports'...\n";
    Schema::create('reports', function (Blueprint $table) {
        $table->id();
        $table->string('type'); // e.g., 'financial_summary', 'investor_activity', 'property_performance'
        $table->json('parameters')->nullable(); // e.g., {"start_date": "2024-01-01", "end_date": "2024-12-31"}
        $table->string('file_path')->nullable();
        $table->foreignId('generated_by')->constrained('users');
        $table->timestamp('generated_at')->useCurrent();
        $table->timestamps();
        $table->softDeletes();
    });
    echo "Created 'reports'.\n";
} else {
    echo "'reports' already exists.\n";
}

// 6. notifications
if (!Schema::hasTable('notifications')) {
    echo "Creating 'notifications'...\n";
    Schema::create('notifications', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('type');
        $table->morphs('notifiable');
        $table->text('data');
        $table->timestamp('read_at')->nullable();
        $table->timestamps();
    });
    echo "Created 'notifications'.\n";
} else {
    echo "'notifications' already exists.\n";
}

// 7. escalation_rules
if (!Schema::hasTable('escalation_rules')) {
    echo "Creating 'escalation_rules'...\n";
    Schema::create('escalation_rules', function (Blueprint $table) {
        $table->id();
        $table->string('trigger_type'); // e.g., 'deadline_overdue', 'task_stalled'
        $table->integer('delay_hours')->default(24);
        $table->foreignId('escalate_to_user_id')->constrained('users');
        $table->string('description')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
    echo "Created 'escalation_rules'.\n";
} else {
    echo "'escalation_rules' already exists.\n";
}

// 8. notification_preferences
if (!Schema::hasTable('notification_preferences')) {
    echo "Creating 'notification_preferences'...\n";
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
    echo "Created 'notification_preferences'.\n";
} else {
    echo "'notification_preferences' already exists.\n";
}

echo "All tables processed.\n";
