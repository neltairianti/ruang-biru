import { Gema, LockedGema, Track } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function getTracks(search?: string): Promise<Track[]> {
  try {
    const url = search 
      ? `${API_BASE_URL}/tracks?q=${encodeURIComponent(search)}`
      : `${API_BASE_URL}/tracks`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengambil daftar lagu');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn('API error, using local fallback:', error);
    // Fallback static data if backend is momentarily unreachable
    return [
      { id: 1, title: 'Untuk Perempuan yang Sedang Dalam Pelukan', artist: 'Payung Teduh', album: 'Dunia Batas', duration: '4:28', icon: '☾', cover_class: 'cover-one' },
      { id: 2, title: 'Rehat', artist: 'Kunto Aji', album: 'Mantra Mantra', duration: '3:47', icon: '✳', cover_class: 'cover-two' },
      { id: 3, title: 'Sampai Jadi Debu', artist: 'Banda Neira', album: 'Berjalan Lebih Jauh', duration: '3:31', icon: '◌', cover_class: 'cover-three' },
      { id: 4, title: 'Evaluasi', artist: 'Hindia', album: 'Menari Dengan Bayangan', duration: '3:24', icon: '✳', cover_class: 'cover-two' },
    ];
  }
}

export async function searchTracks(query: string, signal: AbortSignal): Promise<Track[]> {
  const params = new URLSearchParams({ q: query });
  const search = async (url: string, requestSignal: AbortSignal) => {
    const response = await fetch(`${url}?${params}`, {
      signal: requestSignal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Katalog lagu sedang tidak tersedia. Coba lagi sebentar.');
    return (await response.json()).data as Track[];
  };

  const catalogs = await Promise.allSettled([
    search(`${API_BASE_URL}/tracks/search`, AbortSignal.any([signal, AbortSignal.timeout(5000)])),
    search('/api/music-search', signal),
  ]);
  if (catalogs.every(result => result.status === 'rejected')) {
    throw new Error('Katalog lagu sedang tidak tersedia. Coba lagi sebentar.');
  }
  return catalogs.flatMap(result => result.status === 'fulfilled' ? result.value : []);
}

export async function getFeaturedGemas(): Promise<Gema[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/gemas?featured=1`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengambil gema pilihan');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn('API error, using local fallback:', error);
    return [
      {
        id: 1,
        slug: 'rehat-tenang',
        title: 'Untuk seseorang yang lelah.',
        track_title: 'Rehat',
        track_artist: 'Kunto Aji',
        recipient: 'seseorang yang lelah',
        sender: 'Kawan',
        message: 'Dengerin ini kalau kamu lagi ngerasa semua yang kamu lakuin belum cukup.',
        mood: 'Terima kasih',
        reveal_at: 'Sekarang',
        is_featured: true,
      },
      {
        id: 2,
        slug: 'berdua-saja-rindu',
        title: 'Untuk kamu di sana.',
        track_title: 'Berdua Saja',
        track_artist: 'Payung Teduh',
        recipient: 'Kamu',
        sender: 'A',
        message: 'Kota ini selalu terasa lebih kecil setelah aku tahu kamu ada di dalamnya.',
        mood: 'Rindu',
        reveal_at: 'Sekarang',
        is_featured: true,
      },
      {
        id: 3,
        slug: 'evaluasi-semangat',
        title: 'Untuk Rara.',
        track_title: 'Evaluasi',
        track_artist: 'Hindia',
        recipient: 'Rara',
        sender: 'Anonim',
        message: 'Buat hari pertamamu. Aku tahu kamu bisa. Aku tahu kamu akan bersinar.',
        mood: 'Semangat',
        reveal_at: 'Sekarang',
        is_featured: true,
      },
    ];
  }
}

export type RecipientMatch = Pick<Gema, 'slug' | 'recipient' | 'track_title' | 'track_artist' | 'created_at'>;

export async function searchGemaRecipients(query: string, signal: AbortSignal): Promise<RecipientMatch[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`${API_BASE_URL}/gemas/recipients?${params}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new Error('Pencarian penerima sedang tidak tersedia.');
  const result: { data: RecipientMatch[] } = await response.json();
  return result.data;
}

export async function createGema(data: {
  track_title: string;
  track_artist: string;
  spotify_id?: string | null;
  spotify_url?: string | null;
  apple_music_url?: string | null;
  cover_url?: string | null;
  recipient: string;
  sender?: string;
  message?: string;
  reveal_at: string;
  open_on?: string;
  reply_to?: string;
}): Promise<Gema> {
  const res = await fetch(`${API_BASE_URL}/gemas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || 'Gagal meracik gema');
  }

  const json = await res.json();
  return json.data;
}

export async function getGemaBySlug(slug: string): Promise<Gema | LockedGema | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/gemas/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('Error fetching gema:', err);
    return null;
  }
}
