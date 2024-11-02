<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // $table->date('start_date')->nullable();
            // $table->date('end_date')->nullable(); // Schedule valid until, nullable for current/active schedules
            $table->string('name')->nullable();
            $table->time('start_time'); // Daily start time
            $table->time('end_time'); // Daily end time
            $table->decimal('total_hours', 5, 2)->nullable(); // Hours per day (e.g., 8.5)
            $table->string('week_day')->nullable(); // E.g., 'Monday' or 'Weekend'
            // $table->boolean('schedule_active')->default(1)->comment('1 for active, 0 for in_active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
