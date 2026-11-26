export interface Track {
  id: number | string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  icon: string;
  cover_class: string;
  spotify_id?: string | null;
  spotify_url?: string | null;
  apple_music_url?: string | null;
  cover_url?: string | null;
}

export interface Gema {
  id: number;
  slug: string;
  title: string;
  track_title: string;
  track_artist: string;
  spotify_id?: string | null;
  spotify_url?: string | null;
  apple_music_url?: string | null;
  cover_url?: string | null;
  recipient: string;
  sender?: string | null;
  message?: string | null;
  mood: 'Rindu' | 'Terima kasih' | 'Semangat' | 'Rahasia';
  reveal_at: string;
  open_on?: string | null;
  is_featured?: boolean;
  created_at?: string | null;
  original_gema?: OriginalGema | null;
}

type OriginalGema = Pick<Gema, 'slug' | 'recipient' | 'sender' | 'message' | 'track_title' | 'track_artist' | 'spotify_id' | 'apple_music_url'>;

export type LockedGema = {
  locked: true;
  recipient: string;
  open_on: string;
};
