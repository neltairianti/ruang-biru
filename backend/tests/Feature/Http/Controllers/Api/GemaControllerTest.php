<?php

namespace Tests\Feature\Http\Controllers\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class GemaControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_scheduled_gema_becomes_available_at_midnight_wib(): void
    {
        $this->travelTo(Carbon::parse('2026-12-04 23:59:59', 'Asia/Jakarta'));

        $gema = $this->postJson('/api/gemas', [
            'recipient' => 'Rara',
            'track_title' => 'Rehat',
            'track_artist' => 'Kunto Aji',
            'message' => 'Pesan untuk besok',
            'open_on' => '2026-12-05',
        ])->assertCreated()->assertJsonPath('data.open_on', '2026-12-05')->json('data');

        $this->assertDatabaseHas('gemas', ['slug' => $gema['slug'], 'open_on' => '2026-12-05']);

        $lockedResponse = [
            'success' => true,
            'data' => ['locked' => true, 'recipient' => 'Rara', 'open_on' => '2026-12-05'],
        ];

        $this->getJson("/api/gemas/{$gema['slug']}")->assertOk()->assertExactJson($lockedResponse);
        $this->getJson("/api/gemas/{$gema['id']}")->assertOk()->assertExactJson($lockedResponse);
        $this->getJson('/api/gemas')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/gemas/recipients?q=Rara')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/gemas', [
            'recipient' => 'Aji',
            'track_title' => 'Evaluasi',
            'track_artist' => 'Hindia',
            'reply_to' => $gema['slug'],
        ])->assertUnprocessable()->assertJsonValidationErrors('reply_to');

        $this->travelTo(Carbon::parse('2026-12-05 00:00:00', 'Asia/Jakarta'));

        $this->getJson("/api/gemas/{$gema['slug']}")->assertOk()
            ->assertJsonPath('data.track_title', 'Rehat')
            ->assertJsonPath('data.message', 'Pesan untuk besok');
        $this->getJson('/api/gemas/recipients?q=Rara')->assertOk()
            ->assertJsonPath('data.0.slug', $gema['slug']);
    }

    public function test_opening_date_in_the_past_is_rejected_with_422(): void
    {
        $this->travelTo(Carbon::parse('2026-12-05 00:00:00', 'Asia/Jakarta'));

        $this->postJson('/api/gemas', [
            'recipient' => 'Rara',
            'track_title' => 'Rehat',
            'track_artist' => 'Kunto Aji',
            'open_on' => '2026-12-04',
        ])->assertUnprocessable()->assertJsonValidationErrors('open_on');
    }

    public function test_gema_without_an_opening_date_is_immediately_available(): void
    {
        $slug = $this->postJson('/api/gemas', [
            'recipient' => 'Rara',
            'track_title' => 'Rehat',
            'track_artist' => 'Kunto Aji',
        ])->assertCreated()->json('data.slug');

        $this->getJson("/api/gemas/{$slug}")->assertOk()->assertJsonPath('data.track_title', 'Rehat');
    }

    public function test_reply_links_back_to_the_original_gema(): void
    {
        $original = $this->postJson('/api/gemas', [
            'recipient' => 'Rara',
            'sender' => 'Aji',
            'track_title' => 'Rehat',
            'track_artist' => 'Kunto Aji',
            'message' => 'Istirahat dulu, ya.',
        ])->assertCreated()->json('data');

        $reply = $this->postJson('/api/gemas', [
            'recipient' => 'Aji',
            'track_title' => 'Evaluasi',
            'track_artist' => 'Hindia',
            'message' => 'Terima kasih.',
            'reply_to' => $original['slug'],
        ])->assertCreated()->json('data');

        $this->assertDatabaseHas('gemas', ['slug' => $reply['slug'], 'reply_to_gema_id' => $original['id']]);
        $this->getJson("/api/gemas/{$reply['slug']}")->assertOk()
            ->assertJsonPath('data.message', 'Terima kasih.')
            ->assertJsonPath('data.original_gema.slug', $original['slug'])
            ->assertJsonPath('data.original_gema.track_title', 'Rehat')
            ->assertJsonPath('data.original_gema.message', 'Istirahat dulu, ya.');
    }
}
