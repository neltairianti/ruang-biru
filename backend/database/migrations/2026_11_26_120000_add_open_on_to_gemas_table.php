<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gemas', function (Blueprint $table) {
            $table->date('open_on')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('gemas', function (Blueprint $table) {
            $table->dropColumn('open_on');
        });
    }
};
