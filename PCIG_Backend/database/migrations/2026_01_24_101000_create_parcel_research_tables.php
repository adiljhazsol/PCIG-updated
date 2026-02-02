<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('parcel_research')) {
            Schema::create('parcel_research', function (Blueprint $table) {
                $table->id();
                $table->string('parcel_id')->index();
                $table->string('county')->nullable();
                $table->text('research_notes')->nullable();
                $table->foreignId('researched_by')->constrained('users');
                $table->timestamp('researched_at')->useCurrent();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('parcel_documents')) {
            Schema::create('parcel_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('parcel_research_id')->constrained('parcel_research')->cascadeOnDelete();
                $table->string('type')->nullable(); // e.g., 'tax_bill', 'deed', 'map'
                $table->string('file_path');
                $table->string('file_name');
                $table->integer('file_size')->nullable();
                $table->string('mime_type')->nullable();
                $table->foreignId('uploaded_by')->constrained('users');
                $table->timestamp('uploaded_at')->useCurrent();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('parcel_documents');
        Schema::dropIfExists('parcel_research');
    }
};
