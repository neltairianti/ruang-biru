import type { Gema } from '@/types';

const storageKey = 'ruang-biru:gema-history';
const changeEvent = 'gema-history-change';

type HistoryEntry = Pick<Gema, 'slug' | 'recipient' | 'track_title' | 'track_artist' | 'cover_url' | 'created_at'>;

export function readHistorySnapshot() {
  try {
    return window.localStorage.getItem(storageKey) ?? '';
  } catch {
    return '';
  }
}

export function parseGemaHistory(snapshot: string): HistoryEntry[] {
  if (!snapshot) return [];

  try {
    const entries = JSON.parse(snapshot);
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

export function subscribeToGemaHistory(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) onStoreChange();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(changeEvent, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(changeEvent, onStoreChange);
  };
}

export function saveGemaHistory(gema: Gema) {
  const { slug, recipient, track_title, track_artist, cover_url, created_at } = gema;
  const entry: HistoryEntry = { slug, recipient, track_title, track_artist, cover_url, created_at };

  try {
    const existing = parseGemaHistory(readHistorySnapshot());
    const history = [entry, ...existing.filter(item => item.slug !== slug)];
    window.localStorage.setItem(storageKey, JSON.stringify(history));
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch {
    return false;
  }
}
