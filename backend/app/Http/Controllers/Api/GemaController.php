<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class GemaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $featured = $request->query('featured');

        $gemas = Gema::query()
            ->available()
            ->when($featured !== null, function ($q) {
                $q->where('is_featured', true);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $gemas,
        ]);
    }

    public function searchRecipients(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:50',
        ]);

        $name = strtr(Str::lower($validated['q']), ['!' => '!!', '%' => '!%', '_' => '!_']);
        $gemas = Gema::query()
            ->available()
            ->whereRaw("LOWER(recipient) LIKE ? ESCAPE '!'", ["%{$name}%"])
            ->orderBy('recipient')
            ->latest()
            ->orderByDesc('id')
            ->get(['slug', 'recipient', 'track_title', 'track_artist', 'created_at']);

        return response()->json(['data' => $gemas]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'track_title' => 'required|string|max:255',
            'track_artist' => 'required|string|max:255',
            'recipient' => 'required|string|max:50',
            'sender' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:180',
            'mood' => 'nullable|string|in:Rindu,Terima kasih,Semangat,Rahasia',
            'reveal_at' => 'nullable|string|max:50',
            'open_on' => ['nullable', Rule::date()->format('Y-m-d')->afterOrEqual(Gema::todayForOpening())],
            'reply_to' => 'nullable|string|max:255',
            'spotify_id' => 'nullable|string|max:100',
            'spotify_url' => 'nullable|string|max:255',
            'apple_music_url' => [
                'nullable',
                'string',
                'max:500',
                'regex:~\Ahttps://music\.apple\.com/[a-z]{2}/album/(?:[^/?#]+/)?[0-9]+\?i=[0-9]+\z~',
            ],
            'cover_url' => 'nullable|string|max:500',
        ]);

        $original = null;
        if (isset($validated['reply_to'])) {
            $original = Gema::query()->available()->where('slug', $validated['reply_to'])->first(['id']);

            if (! $original) {
                throw ValidationException::withMessages([
                    'reply_to' => 'Gema awal belum bisa dibalas atau sudah tidak tersedia.',
                ]);
            }
        }

        $recipient = trim($validated['recipient']);
        $title = ! empty($recipient) ? "Untuk {$recipient}." : 'Untuk seseorang.';

        $gema = Gema::create([
            'slug' => Str::lower(Str::random(8)),
            'title' => $title,
            'track_title' => $validated['track_title'],
            'track_artist' => $validated['track_artist'],
            'spotify_id' => $validated['spotify_id'] ?? null,
            'spotify_url' => $validated['spotify_url'] ?? null,
            'apple_music_url' => $validated['apple_music_url'] ?? null,
            'cover_url' => $validated['cover_url'] ?? null,
            'recipient' => $recipient,
            'sender' => ! empty($validated['sender']) ? trim($validated['sender']) : null,
            'message' => $validated['message'] ?? null,
            'mood' => $validated['mood'] ?? 'Rindu',
            'reveal_at' => $validated['reveal_at'] ?? 'Sekarang',
            'open_on' => $validated['open_on'] ?? null,
            'reply_to_gema_id' => $original?->id,
            'is_featured' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gema berhasil diracik',
            'data' => $gema,
        ], 201);
    }

    public function show(string $slug): JsonResponse
    {
        $gema = Gema::where('slug', $slug)->first();
        if (! $gema && ctype_digit($slug)) {
            $id = filter_var(ltrim($slug, '0'), FILTER_VALIDATE_INT);
            if ($id !== false) {
                $gema = Gema::find($id);
            }
        }

        if (! $gema) {
            return response()->json([
                'success' => false,
                'message' => 'Gema tidak ditemukan',
            ], 404);
        }

        if ($gema->isLocked()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'locked' => true,
                    'recipient' => $gema->recipient,
                    'open_on' => $gema->open_on,
                ],
            ])->header('Cache-Control', 'no-store');
        }

        if ($gema->reply_to_gema_id !== null) {
            $gema->load(['originalGema' => fn ($query) => $query->available()->select(
                'id', 'slug', 'recipient', 'sender', 'message', 'track_title', 'track_artist', 'spotify_id', 'apple_music_url',
            )]);
        }

        return response()->json([
            'success' => true,
            'data' => $gema,
        ]);
    }
}
