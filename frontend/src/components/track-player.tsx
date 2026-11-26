import { appleMusicEmbedUrl } from '@/lib/apple-music';

export function TrackPlayer({ spotifyId, appleMusicUrl }: {
  spotifyId?: string | null;
  appleMusicUrl?: string | null;
}) {
  const spotify = spotifyId && /^[a-zA-Z0-9]+$/.test(spotifyId);
  const src = spotify
    ? `https://open.spotify.com/embed/track/${spotifyId}?theme=0`
    : appleMusicEmbedUrl(appleMusicUrl);

  if (!src) return null;

  return (
    <iframe
      src={src}
      title={spotify ? 'Pemutar lagu Spotify' : 'Pemutar lagu Apple Music'}
      width="100%"
      height={spotify ? 80 : 175}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="w-full rounded-xl border-0"
    />
  );
}
