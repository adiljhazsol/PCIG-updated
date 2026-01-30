<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

echo "Fixing database schema...\n";

// --- Fix Properties Table ---
if (Schema::hasTable('properties')) {
    echo "Updating 'properties' table...\n";
    Schema::table('properties', function (Blueprint $table) {
        if (!Schema::hasColumn('properties', 'current_value')) {
            $table->decimal('current_value', 15, 2)->default(0);
        }
        if (!Schema::hasColumn('properties', 'purchase_price')) {
            $table->decimal('purchase_price', 15, 2)->default(0);
        }
        if (!Schema::hasColumn('properties', 'workflow_stage')) {
            $table->string('workflow_stage')->nullable();
        }
        if (!Schema::hasColumn('properties', 'parcel_id')) {
            $table->string('parcel_id')->nullable();
        }
        if (!Schema::hasColumn('properties', 'city')) {
            $table->string('city')->nullable();
        }
        if (!Schema::hasColumn('properties', 'county')) {
            $table->string('county')->nullable();
        }
        if (!Schema::hasColumn('properties', 'state')) {
            $table->string('state')->nullable();
        }
        if (!Schema::hasColumn('properties', 'zip_code')) {
            $table->string('zip_code')->nullable();
        }
        if (!Schema::hasColumn('properties', 'total_shares')) {
            $table->integer('total_shares')->default(100);
        }
        if (!Schema::hasColumn('properties', 'available_shares')) {
            $table->integer('available_shares')->default(0);
        }
        if (!Schema::hasColumn('properties', 'price_per_share')) {
            $table->decimal('price_per_share', 10, 2)->default(0);
        }
        if (!Schema::hasColumn('properties', 'purchase_date')) {
            $table->date('purchase_date')->nullable();
        }
        if (!Schema::hasColumn('properties', 'deleted_at')) {
            $table->softDeletes();
        }
    });

    // Data Migration for Properties
    $properties = DB::table('properties')->get();
    foreach ($properties as $prop) {
        $update = [];
        // Map est_value to current_value if possible
        if (isset($prop->est_value) && $prop->current_value == 0) {
            // Remove '$' and ',' 
            $val = preg_replace('/[^\d.]/', '', $prop->est_value);
            if (is_numeric($val)) {
                $update['current_value'] = $val;
            }
        }
        // Map property_code to parcel_id
        if (isset($prop->property_code) && empty($prop->parcel_id)) {
            $update['parcel_id'] = $prop->property_code;
        }
        // Map location to city/state
        if (isset($prop->location) && empty($prop->city)) {
            // Assume "City, State Zip" or "City, State"
            $parts = explode(',', $prop->location);
            if (count($parts) >= 2) {
                $update['city'] = trim($parts[0]);
                $stateZip = trim($parts[1]);
                $szParts = explode(' ', $stateZip);
                $update['state'] = $szParts[0] ?? '';
                $update['zip_code'] = $szParts[1] ?? '';
            }
        }
        
        if (!empty($update)) {
            DB::table('properties')->where('id', $prop->id)->update($update);
        }
    }
}

// --- Fix Investments Table ---
if (Schema::hasTable('investments')) {
    echo "Updating 'investments' table...\n";
    Schema::table('investments', function (Blueprint $table) {
        if (!Schema::hasColumn('investments', 'amount')) {
            $table->decimal('amount', 15, 2)->default(0);
        }
        if (!Schema::hasColumn('investments', 'property_id')) {
            $table->unsignedBigInteger('property_id')->nullable();
        }
        if (!Schema::hasColumn('investments', 'shares')) {
            $table->integer('shares')->default(0);
        }
        if (!Schema::hasColumn('investments', 'price_per_share')) {
            $table->decimal('price_per_share', 10, 2)->default(0);
        }
        if (!Schema::hasColumn('investments', 'purchase_date')) {
            $table->date('purchase_date')->nullable();
        }
    });

    // Data Migration for Investments
    $investments = DB::table('investments')->get();
    foreach ($investments as $inv) {
        $update = [];
        // Map current_value to amount
        if (isset($inv->current_value) && $inv->amount == 0) {
             $val = preg_replace('/[^\d.]/', '', $inv->current_value);
             if (is_numeric($val)) {
                 $update['amount'] = $val;
             }
        }
        // Map investment_id (string code) to property_id (integer FK)
        if (isset($inv->investment_id) && empty($inv->property_id)) {
            // Find property by property_code (which matches investment_id string)
            // Need to check if properties has property_code first. 
            // My check_columns showed 'property_code' exists.
            $property = DB::table('properties')->where('property_code', $inv->investment_id)->first();
            if ($property) {
                $update['property_id'] = $property->id;
            } else {
                // If no match by code, maybe try ID if numeric?
                if (is_numeric($inv->investment_id)) {
                    $update['property_id'] = $inv->investment_id;
                }
            }
        }
        
        if (!empty($update)) {
            DB::table('investments')->where('id', $inv->id)->update($update);
        }
    }
}

// --- Fix Tasks Table ---
if (Schema::hasTable('tasks')) {
    echo "Updating 'tasks' table...\n";
    Schema::table('tasks', function (Blueprint $table) {
        if (!Schema::hasColumn('tasks', 'deleted_at')) {
            $table->softDeletes();
        }
    });
}

// --- Create activity_log Table ---
if (!Schema::hasTable('activity_log')) {
    echo "Creating 'activity_log' table...\n";
    Schema::create('activity_log', function (Blueprint $table) {
        $table->bigIncrements('id');
        $table->string('log_name')->nullable();
        $table->text('description');
        $table->string('subject_type')->nullable();
        $table->unsignedBigInteger('subject_id')->nullable();
        $table->string('causer_type')->nullable();
        $table->unsignedBigInteger('causer_id')->nullable();
        $table->json('properties')->nullable();
        $table->string('event')->nullable();
        $table->uuid('batch_uuid')->nullable();
        $table->timestamps();
        $table->index('log_name');
        $table->index(['subject_type', 'subject_id']);
        $table->index(['causer_type', 'causer_id']);
    });
}

echo "Schema update completed.\n";
