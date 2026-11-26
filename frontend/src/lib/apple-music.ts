export function appleMusicEmbedUrl(value?: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const trackId = url.searchParams.get('i') ?? '';
    if (url.origin !== 'https://music.apple.com'
      || !/^\/[a-z]{2}\/album\/(?:[^/]+\/)?\d+$/.test(url.pathname)
      || !/^\d+$/.test(trackId)) return null;

    return `https://embed.music.apple.com${url.pathname}?i=${trackId}&theme=dark`;
  } catch {
    return null;
  }
}
