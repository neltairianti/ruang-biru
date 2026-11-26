<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class TrackController extends Controller
{
    public function searchSpotify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $clientId = config('services.spotify.client_id');
        $clientSecret = config('services.spotify.client_secret');

        if (!$clientId || !$clientSecret) {
            return response()->json([
                'success' => false,
                'message' => 'Pencarian Spotify belum dikonfigurasi. Isi SPOTIFY_CLIENT_ID dan SPOTIFY_CLIENT_SECRET di backend/.env.',
            ], 503);
        }

        try {
            $token = Cache::remember('spotify.catalog_access_token', now()->addMinutes(50), function () use ($clientId, $clientSecret) {
                $response = Http::asForm()
                    ->withBasicAuth($clientId, $clientSecret)
                    ->timeout(10)
                    ->post('https://accounts.spotify.com/api/token', [
                        'grant_type' => 'client_credentials',
                    ]);

                if (!$response->successful()) {
                    throw new \RuntimeException('Spotify gagal memberikan token akses.');
                }

                return $response->json('access_token');
            });

            $response = Http::withToken($token)
                ->timeout(10)
                ->get('https://api.spotify.com/v1/search', [
                    'q' => $validated['q'],
                    'type' => 'track',
                    'market' => 'ID',
                    'limit' => 10,
                ]);

            if (!$response->successful()) {
                if ($response->status() === 401) {
                    Cache::forget('spotify.catalog_access_token');
                }

                return response()->json([
                    'success' => false,
                    'message' => $response->status() === 429
                        ? 'Pencarian Spotify sedang ramai. Coba lagi sebentar.'
                        : 'Spotify tidak dapat menyelesaikan pencarian saat ini.',
                ], $response->status() === 429 ? 429 : 502);
            }

            $tracks = collect($response->json('tracks.items', []))
                ->map(fn (array $track) => [
                    'id' => $track['id'],
                    'title' => $track['name'],
                    'artist' => collect($track['artists'] ?? [])->pluck('name')->implode(', '),
                    'album' => $track['album']['name'] ?? null,
                    'duration' => sprintf('%d:%02d', intdiv($track['duration_ms'] ?? 0, 60000), intdiv(($track['duration_ms'] ?? 0) % 60000, 1000)),
                    'icon' => 'sparkle',
                    'cover_class' => 'cover-one',
                    'spotify_id' => $track['id'],
                    'spotify_url' => $track['external_urls']['spotify'] ?? "https://open.spotify.com/track/{$track['id']}",
                    'cover_url' => $track['album']['images'][0]['url'] ?? null,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $tracks]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa terhubung ke Spotify. Coba lagi nanti.',
            ], 502);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = $request->query('q');

        $tracks = Track::query()
            ->when($query, function ($q) use ($query) {
                $q->where('title', 'ilike', "%{$query}%")
                  ->orWhere('artist', 'ilike', "%{$query}%")
                  ->orWhere('album', 'ilike', "%{$query}%");
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tracks,
        ]);
    }

    public function importSpotify(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|string',
        ]);

        $url = trim($request->input('url'));

        // Extract spotify track ID
        if (preg_match('/track\/([a-zA-Z0-9]+)/', $url, $matches)) {
            $spotifyId = $matches[1];
        } elseif (preg_match('/spotify:track:([a-zA-Z0-9]+)/', $url, $matches)) {
            $spotifyId = $matches[1];
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Format URL atau ID Spotify tidak valid.',
            ], 422);
        }

        $canonicalUrl = "https://open.spotify.com/track/{$spotifyId}";

        // Check if already in database
        $existing = Track::where('spotify_id', $spotifyId)->first();
        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Lagu sudah ada di daftar',
                'data' => $existing,
            ]);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ])->get("https://open.spotify.com/oembed", [
                'url' => $canonicalUrl,
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lagu Spotify tidak ditemukan di server Spotify.',
                ], 404);
            }

            $oembed = $response->json();
            $title = $oembed['title'] ?? 'Lagu Spotify';
            $artist = $oembed['author_name'] ?? 'Spotify Artist';
            $coverUrl = $oembed['thumbnail_url'] ?? null;

            $track = Track::create([
                'title' => $title,
                'artist' => $artist,
                'album' => 'Spotify Single',
                'duration' => '3:30',
                'icon' => 'sparkle',
                'cover_class' => 'cover-one',
                'spotify_id' => $spotifyId,
                'spotify_url' => $canonicalUrl,
                'cover_url' => $coverUrl,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lagu dari Spotify berhasil ditambahkan!',
                'data' => $track,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dari Spotify: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:10',
            'icon' => 'nullable|string|max:20',
            'cover_class' => 'nullable|string|max:50',
            'spotify_id' => 'nullable|string|max:100',
            'spotify_url' => 'nullable|string|max:255',
            'cover_url' => 'nullable|string|max:500',
        ]);

        $track = Track::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lagu berhasil ditambahkan',
            'data' => $track,
        ], 201);
    }
}
