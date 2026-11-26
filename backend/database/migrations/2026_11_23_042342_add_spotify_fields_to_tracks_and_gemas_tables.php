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
        Schema::table('tracks', function (Blueprint $table) {
            $table->string('spotify_id')->nullable()->after('cover_class');
            $table->string('spotify_url')->nullable()->after('spotify_id');
            $table->string('cover_url')->nullable()->after('spotify_url');
        });

        Schema::table('gemas', function (Blueprint $table) {
            $table->string('spotify_id')->nullable()->after('track_artist');
            $table->string('spotify_url')->nullable()->after('spotify_id');
            $table->string('cover_url')->nullable()->after('spotify_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->dropColumn(['spotify_id', 'spotify_url', 'cover_url']);
        });

        Schema::table('gemas', function (Blueprint $table) {
            $table->dropColumn(['spotify_id', 'spotify_url', 'cover_url']);
        });
    }
};
