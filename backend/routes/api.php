<?php

use App\Http\Controllers\Api\GemaController;
use App\Http\Controllers\Api\TrackController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Ruang Biru Endpoints
Route::get('/tracks', [TrackController::class, 'index']);
Route::get('/tracks/search', [TrackController::class, 'searchSpotify']);
Route::post('/tracks', [TrackController::class, 'store']);
Route::post('/tracks/spotify', [TrackController::class, 'importSpotify']);

Route::get('/gemas', [GemaController::class, 'index']);
Route::get('/gemas/recipients', [GemaController::class, 'searchRecipients']);
Route::post('/gemas', [GemaController::class, 'store']);
Route::get('/gemas/{slug}', [GemaController::class, 'show']);
