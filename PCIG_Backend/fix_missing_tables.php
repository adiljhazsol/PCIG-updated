<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

echo "Checking tables...\n";

// 1. investor_profiles
if (!Schema::hasTable('investor_profiles')) {
    echo "Creating investor_profiles table...\n";
    Schema::create('investor_profiles', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('phone')->nullable();
        $table->text('address')->nullable();
        $table->text('ssn_encrypted')->nullable();
        $table->text('bank_account_encrypted')->nullable();
        $table->timestamps();
        $table->index('user_id');
    });
    echo "Created investor_profiles.\n";
} else {
    echo "investor_profiles already exists.\n";
}

// 2. kyc_verifications
if (!Schema::hasTable('kyc_verifications')) {
    echo "Creating kyc_verifications table...\n";
    Schema::create('kyc_verifications', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('status')->default('pending'); // pending, verified, rejected
        $table->timestamp('submitted_at')->nullable();
        $table->timestamp('verified_at')->nullable();
        $table->text('rejection_reason')->nullable();
        $table->timestamps();
    });
    echo "Created kyc_verifications.\n";
} else {
    echo "kyc_verifications already exists.\n";
}

// 3. kyc_documents
if (!Schema::hasTable('kyc_documents')) {
    echo "Creating kyc_documents table...\n";
    Schema::create('kyc_documents', function (Blueprint $table) {
        $table->id();
        $table->foreignId('verification_id')->constrained('kyc_verifications')->onDelete('cascade');
        $table->string('type'); // passport, driver_license, utility_bill
        $table->string('file_path');
        $table->string('status')->default('pending'); // pending, approved, rejected
        $table->timestamps();
    });
    echo "Created kyc_documents.\n";
} else {
    echo "kyc_documents already exists.\n";
}

// 4. investor_invitations
if (!Schema::hasTable('investor_invitations')) {
    echo "Creating investor_invitations table...\n";
    Schema::create('investor_invitations', function (Blueprint $table) {
        $table->id();
        $table->string('email')->unique();
        $table->string('token')->unique();
        $table->foreignId('invited_by')->constrained('users');
        $table->timestamp('invited_at');
        $table->timestamp('accepted_at')->nullable();
        $table->enum('status', ['pending', 'accepted', 'expired'])->default('pending');
        $table->timestamps();
    });
    echo "Created investor_invitations.\n";
} else {
    echo "investor_invitations already exists.\n";
}

// 5. fund_investments
if (!Schema::hasTable('fund_investments')) {
    echo "Creating fund_investments table...\n";
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
    echo "Created fund_investments.\n";
} else {
    echo "fund_investments already exists.\n";
}

// 6. investments
if (!Schema::hasTable('investments')) {
    echo "Creating investments table...\n";
    Schema::create('investments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('property_id')->constrained()->cascadeOnDelete();
        $table->integer('shares')->default(0);
        $table->decimal('amount', 15, 2);
        $table->decimal('price_per_share', 10, 2);
        $table->date('purchase_date');
        $table->enum('status', ['active', 'sold', 'redeemed'])->default('active')->index();
        $table->timestamps();
        $table->index(['user_id', 'property_id']);
        $table->index(['status', 'purchase_date']);
    });
    echo "Created investments.\n";
} else {
    echo "investments already exists.\n";
}

echo "Done.\n";
