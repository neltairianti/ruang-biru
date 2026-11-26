import type { Track } from '@/types';
import { appleMusicEmbedUrl } from '@/lib/apple-music';

type AppleSong = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  trackTimeMillis?: number;
  trackViewUrl?: string;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (query.length < 2 || query.length > 100) {
    return Response.json({ message: 'Masukkan 2–100 karakter untuk mencari lagu.' }, { status: 400 });
  }

  const url = new URL('https://itunes.apple.com/search');
  url.search = new URLSearchParams({ term: query, country: 'ID', media: 'music', entity: 'song', limit: '40' }).toString();

  try {
    const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(7500) });
    if (!response.ok) throw new Error('Katalog iTunes tidak tersedia.');

    const { results }: { results: AppleSong[] } = await response.json();
    const tracks: Track[] = results
      .filter(song => song.trackId && song.trackName && song.artistName)
      .map(song => {
        const seconds = Math.floor((song.trackTimeMillis ?? 0) / 1000);
        const embedUrl = appleMusicEmbedUrl(song.trackViewUrl);
        return {
          id: `itunes-${song.trackId}`,
          title: song.trackName,
          artist: song.artistName,
          album: song.collectionName,
          apple_music_url: embedUrl?.replace('embed.music.apple.com', 'music.apple.com').replace('&theme=dark', '') ?? null,
          duration: seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : '',
          icon: 'sparkle',
          cover_class: 'cover-one',
        };
      });

    return Response.json({ data: tracks });
  } catch {
    return Response.json({ message: 'Katalog lagu sedang tidak tersedia. Coba lagi sebentar.' }, { status: 502 });
  }
}
