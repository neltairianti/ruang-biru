<?php

namespace Database\Seeders;

use App\Models\Gema;
use App\Models\Track;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tracks = [
            [
                'title' => 'Satu Bulan',
                'artist' => 'Bernadya',
                'album' => 'Terlintas',
                'duration' => '3:20',
                'icon' => 'moon',
                'cover_class' => 'cover-one',
                'spotify_id' => '7zOVh5fGpEwSbZd0g9z80B',
                'spotify_url' => 'https://open.spotify.com/track/7zOVh5fGpEwSbZd0g9z80B',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02cb1e5f7d0942bf9196c1e711',
            ],
            [
                'title' => 'Gala Bunga Matahari',
                'artist' => 'Sal Priadi',
                'album' => 'MARKERS AND SUCH PENS FLASHDISKS',
                'duration' => '3:50',
                'icon' => 'sparkle',
                'cover_class' => 'cover-two',
                'spotify_id' => '5eBk8ZXcd0pb0AO4a5PpOg',
                'spotify_url' => 'https://open.spotify.com/track/5eBk8ZXcd0pb0AO4a5PpOg',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02686acaaa87bfc6ebb42b3bd2',
            ],
            [
                'title' => 'Rehat',
                'artist' => 'Kunto Aji',
                'album' => 'Mantra Mantra',
                'duration' => '3:47',
                'icon' => 'sparkle',
                'cover_class' => 'cover-two',
                'spotify_id' => '7mjO4RbTZIb1SfE8G673Lm',
                'spotify_url' => 'https://open.spotify.com/track/7mjO4RbTZIb1SfE8G673Lm',
                'cover_url' => 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b7d74c7fa660999ad4ff0e8d',
            ],
            [
                'title' => 'Rayuan Perempuan Gila',
                'artist' => 'Nadin Amizah',
                'album' => 'Untuk Dunia, Cinta, dan Kotornya',
                'duration' => '5:09',
                'icon' => 'moon',
                'cover_class' => 'cover-three',
                'spotify_id' => '1nYdkPCbHdYi4w7s2L6SHA',
                'spotify_url' => 'https://open.spotify.com/track/1nYdkPCbHdYi4w7s2L6SHA',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0281b37eb02e975a61a6b052ea',
            ],
            [
                'title' => 'Evaluasi',
                'artist' => 'Hindia',
                'album' => 'Menari Dengan Bayangan',
                'duration' => '3:24',
                'icon' => 'sparkle',
                'cover_class' => 'cover-two',
                'spotify_id' => '2dIBMHByUGcNPzmYBJ6OAj',
                'spotify_url' => 'https://open.spotify.com/track/2dIBMHByUGcNPzmYBJ6OAj',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02d623688488865906052ef96b',
            ],
            [
                'title' => 'Sampai Jadi Debu',
                'artist' => 'Banda Neira',
                'album' => 'Berjalan Lebih Jauh',
                'duration' => '3:31',
                'icon' => 'circle',
                'cover_class' => 'cover-three',
                'spotify_id' => '3pRaLNL3b8x5uBOcsgvdqM',
                'spotify_url' => 'https://open.spotify.com/track/3pRaLNL3b8x5uBOcsgvdqM',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02afc2d1d2c8703a10aeded0af',
            ],
            [
                'title' => 'Untuk Perempuan yang Sedang Dalam Pelukan',
                'artist' => 'Payung Teduh',
                'album' => 'Dunia Batas',
                'duration' => '4:28',
                'icon' => 'moon',
                'cover_class' => 'cover-one',
                'spotify_id' => '7KfknhBbaZBQfN7CTsx8L5',
                'spotify_url' => 'https://open.spotify.com/track/7KfknhBbaZBQfN7CTsx8L5',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0268702ca7e5905480c9908903',
            ],
        ];

        foreach ($tracks as $track) {
            Track::create($track);
        }

        $gemas = [
            [
                'slug' => 'satu-bulan-bernadya',
                'title' => 'Untuk kamu yang belum juga selesai di kepalaku.',
                'track_title' => 'Satu Bulan',
                'track_artist' => 'Bernadya',
                'spotify_id' => '7zOVh5fGpEwSbZd0g9z80B',
                'spotify_url' => 'https://open.spotify.com/track/7zOVh5fGpEwSbZd0g9z80B',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02cb1e5f7d0942bf9196c1e711',
                'recipient' => 'Kamu',
                'sender' => 'Seseorang',
                'message' => 'Sudah satu bulan, tapi lagu ini masih selalu terdengar seperti caramu berpamitan.',
                'mood' => 'Rindu',
                'reveal_at' => 'Sekarang',
                'is_featured' => true,
            ],
            [
                'slug' => 'rehat-tenang',
                'title' => 'Untuk seseorang yang lelah.',
                'track_title' => 'Rehat',
                'track_artist' => 'Kunto Aji',
                'spotify_id' => '7mjO4RbTZIb1SfE8G673Lm',
                'spotify_url' => 'https://open.spotify.com/track/7mjO4RbTZIb1SfE8G673Lm',
                'cover_url' => 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02b7d74c7fa660999ad4ff0e8d',
                'recipient' => 'seseorang yang lelah',
                'sender' => 'Kawan',
                'message' => 'Dengerin ini kalau kamu lagi ngerasa semua yang kamu lakuin belum cukup.',
                'mood' => 'Terima kasih',
                'reveal_at' => 'Sekarang',
                'is_featured' => true,
            ],
            [
                'slug' => 'gala-bunga-matahari',
                'title' => 'Untuk yang selalu mekar di hati.',
                'track_title' => 'Gala Bunga Matahari',
                'track_artist' => 'Sal Priadi',
                'spotify_id' => '5eBk8ZXcd0pb0AO4a5PpOg',
                'spotify_url' => 'https://open.spotify.com/track/5eBk8ZXcd0pb0AO4a5PpOg',
                'cover_url' => 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02686acaaa87bfc6ebb42b3bd2',
                'recipient' => 'Rara',
                'sender' => 'Anonim',
                'message' => 'Sampai nanti di sana, tetap mekar seperti bunga matahari.',
                'mood' => 'Semangat',
                'reveal_at' => 'Sekarang',
                'is_featured' => true,
            ],
        ];

        foreach ($gemas as $gema) {
            Gema::create($gema);
        }
    }
}
