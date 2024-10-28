<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('api', function (Blueprint $table) {
            DB::table('roles')->update(['guard_name' => 'api']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('api', function (Blueprint $table) {
            // Revert back to 'web' if needed
            DB::table('roles')->update(['guard_name' => 'web']);
        });
    }
};
