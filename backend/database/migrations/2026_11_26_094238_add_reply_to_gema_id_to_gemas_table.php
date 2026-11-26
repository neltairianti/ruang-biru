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
        Schema::table('gemas', function (Blueprint $table) {
            $table->foreignId('reply_to_gema_id')->nullable()->constrained('gemas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gemas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reply_to_gema_id');
        });
    }
};
