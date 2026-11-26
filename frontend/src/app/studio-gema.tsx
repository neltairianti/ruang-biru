'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TrackCover } from '@/components/track-cover';
import { TrackPlayer } from '@/components/track-player';
import type { Gema, Track } from '@/types';
import { createGema, getTracks, searchTracks } from '@/lib/api';
import { saveGemaHistory } from '@/lib/gema-history';
import { formatGemaOpeningDate } from '@/lib/gema-opening-date';

type StudioGemaProps = {
  replyTo?: Pick<Gema, 'slug' | 'sender' | 'track_title' | 'track_artist'>;
};

export function StudioGema({ replyTo }: StudioGemaProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [catalogTracks, setCatalogTracks] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Form state
  const [recipient, setRecipient] = useState(() => replyTo?.sender?.trim().slice(0, 50) ?? '');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [openOn, setOpenOn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Dialog & Toast state
  const [createdGema, setCreatedGema] = useState<Gema | null>(null);
  const [historySaved, setHistorySaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    getTracks().then(setTracks);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      searchTracks(query, controller.signal)
        .then(results => {
          if (!controller.signal.aborted) setCatalogTracks(results);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setCatalogError('Katalog lagu sedang tidak tersedia. Coba lagi sebentar.');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  const updateSearch = (value: string) => {
    if (value === searchQuery) return;
    setSearchQuery(value);
    setCatalogTracks([]);
    setCatalogError(null);
    setIsSearching(value.trim().length >= 2);
  };

  const query = searchQuery.trim().toLowerCase();
  const localMatches = query
    ? tracks.filter(track =>
        `${track.title} ${track.artist} ${track.album ?? ''}`.toLowerCase().includes(query)
      )
    : [];
  const seenTracks = new Set<string>();
  const filteredTracks = [...localMatches, ...catalogTracks].filter(track => {
    const key = [track.title, track.artist, track.album].join('|').normalize('NFKC').toLowerCase();
    if (seenTracks.has(key)) return false;
    seenTracks.add(key);
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const newGema = await createGema({
        track_title: selectedTrack.title,
        track_artist: selectedTrack.artist,
        spotify_id: selectedTrack.spotify_id,
        spotify_url: selectedTrack.spotify_url,
        apple_music_url: selectedTrack.apple_music_url,
        cover_url: selectedTrack.cover_url,
        recipient: recipient.trim() || 'Seseorang',
        sender: sender.trim() || undefined,
        message: message.trim() || undefined,
        reveal_at: isScheduled ? 'Terjadwal' : 'Sekarang',
        open_on: isScheduled ? openOn : undefined,
        reply_to: replyTo?.slug,
      });
      setHistorySaved(saveGemaHistory(newGema));
      setCreatedGema(newGema);
      setIsModalOpen(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setSubmitError(`Gagal membuat gema. ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sharePath = createdGema ? `/gema/${encodeURIComponent(createdGema.slug)}` : '';

  const handleCopyLink = async () => {
    if (!sharePath) return;
    const shareUrl = new URL(sharePath, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('textarea');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setToastMessage('Tautan berhasil disalin!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <section id="buat" className="section-space relative" style={{ background: 'var(--surface)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 80% 20%, rgba(34,211,238,0.04) 0%, transparent 60%)' }} />
        <div className="site-width">
          <form onSubmit={handleSubmit} className="glass rounded-3xl border border-white/8 overflow-hidden">
            <h2 className="border-b border-white/10 px-5 py-5 text-2xl font-extrabold tracking-tight sm:px-8 sm:py-6 sm:text-3xl">
              {replyTo ? 'Balas dengan lagu' : 'Gema baru'}
            </h2>

            <div className="space-y-7 p-5 sm:p-8">
              {replyTo && (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-muted)] wrap-anywhere">
                  Membalas Gema{' '}
                  <Link href={`/gema/${encodeURIComponent(replyTo.slug)}`} className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
                    {replyTo.track_title} · {replyTo.track_artist}
                  </Link>
                </p>
              )}
              {/* 01 Track selection */}
              <div className="space-y-2.5">
                <label htmlFor="track-search" className="block text-sm font-semibold leading-5 text-[var(--text)]">
                  Pilih lagu
                </label>
                <div className="relative">
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center text-[var(--text-dim)]">
                    <span className="relative size-4">
                      <span className="absolute top-0 left-0 size-3 rounded-full border-2 border-current" />
                      <span className="absolute right-0 bottom-0 h-0.5 w-2 origin-right rotate-45 rounded-full bg-current" />
                    </span>
                  </span>
                  <input
                    type="search"
                    id="track-search"
                    placeholder="Cari judul lagu atau nama artis"
                    maxLength={100}
                    value={searchQuery}
                    onChange={e => updateSearch(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-base text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
                {searchQuery.trim().length >= 2 && (
                  <div className="text-xs text-[var(--text-dim)]" aria-live="polite">
                    {isSearching ? 'Mencari lagu…' : catalogError || (filteredTracks.length > 0 ? 'Pilih lagu dari hasil pencarian.' : '')}
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredTracks.map((track) => {
                    const isSelected = selectedTrack?.id === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTrack(track)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all group ${
                          isSelected
                            ? 'bg-[var(--card-hover)] border border-[var(--accent)]'
                            : 'bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/15'
                        }`}
                      >
                        {/* Cover art */}
                        <div className="relative flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden">
                          <TrackCover src={track.cover_url} className="h-full w-full" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span aria-hidden="true" className="text-white text-sm">✓</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                            {track.title}
                          </div>
                          <div className={`text-xs truncate mt-0.5 ${isSelected ? 'text-violet-300' : 'text-[var(--text-dim)]'}`}>
                            {track.artist}{track.album ? ` · ${track.album}` : ''}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-xs tabular-nums ${isSelected ? 'text-violet-300' : 'text-[var(--text-dim)]'}`}>
                            {track.duration}
                          </span>
                          {track.spotify_id && (
                            <span className="text-xs text-green-400">
                              Spotify
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {query.length >= 2 && filteredTracks.length === 0 && !isSearching && !catalogError && (
                    <div className="text-center py-8 text-sm text-[var(--text-dim)]">
                      Lagu belum ditemukan. Coba judul dan nama artis sekaligus.
                    </div>
                  )}
                </div>

                {selectedTrack && (
                  <TrackPlayer
                    spotifyId={selectedTrack.spotify_id}
                    appleMusicUrl={selectedTrack.apple_music_url}
                  />
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white/5" />

              {/* 02 Recipient & sender */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="recipient" className="block text-sm font-semibold leading-5 text-[var(--text)]">
                    Nama penerima <span aria-hidden="true" className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="recipient"
                    aria-describedby="recipient-discoverability"
                    placeholder="Nama panggilan mereka"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-base text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                 
                </div>
                <div className="space-y-2">
                  <label htmlFor="sender" className="block text-sm font-semibold leading-5 text-[var(--text)]">
                    Nama pengirim
                  </label>
                  <input
                    type="text"
                    id="sender"
                    placeholder="Kosongkan jika ingin anonim"
                    value={sender}
                    onChange={e => setSender(e.target.value)}
                    maxLength={32}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-base text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              </div>

              {/* 03 Message */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="message" className="block text-sm font-semibold leading-5 text-[var(--text)]">
                    Pesan
                    <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">Opsional</span>
                  </label>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--text-dim)]">{message.length}/180</span>
                </div>
                <textarea
                  id="message"
                  placeholder="Tulis pesan untuk penerima"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={180}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-base text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                />
              </div>

              {/* 04 Timing */}
              <div className="space-y-2">
                <label htmlFor="reveal-at" className="block text-sm font-semibold leading-5 text-[var(--text)]">
                  Waktu buka Gema
                </label>
                <select
                  id="reveal-at"
                  value={isScheduled ? 'scheduled' : 'now'}
                  onChange={e => setIsScheduled(e.target.value === 'scheduled')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-base text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="now" className="bg-zinc-900">Dibuka kapan saja</option>
                  <option value="scheduled" className="bg-zinc-900">Dibuka pada tanggal tertentu</option>
                </select>
                {isScheduled && (
                  <label className="block space-y-2 text-sm text-[var(--text-muted)]">
                    <span>Tanggal buka · pukul 00.00 WIB</span>
                    <input
                      type="date"
                      required
                      min={new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })}
                      value={openOn}
                      onChange={event => setOpenOn(event.target.value)}
                      className="block w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-base text-white"
                    />
                  </label>
                )}
              </div>

              {submitError && <p role="alert" className="text-sm text-rose-300">{submitError}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedTrack}
                className="primary-action w-full"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                      Membuat gema…
                    </>
                  ) : (
                    <>Buat gema</>
                  )}
                </span>
              </button>

            </div>
          </form>
        </div>
      </section>

      {/* ─── Success Modal ─── */}
      {isModalOpen && createdGema && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="glass rounded-3xl border border-violet-500/30 max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto animate-scale-in">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-violet-600/30 to-cyan-600/20 p-6 text-center relative">
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup"
                className="icon-action absolute top-4 right-4 grid size-8 place-items-center rounded-full text-sm"
              >
                ✕
              </button>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl mx-auto mb-4">
                ♫
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--accent)]">
                Satu Gema Telah Diracik
              </span>
              <h2 className="text-xl font-black text-white mt-2">{createdGema.title}</h2>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/8 space-y-3">
                <div className="font-semibold text-sm text-white">
                  {createdGema.track_title}
                  <span className="text-[var(--text-muted)] font-normal ml-2">· {createdGema.track_artist}</span>
                </div>
                {createdGema.message && (
                  <p className="font-serif italic text-sm text-[var(--text-muted)] bg-white/3 rounded-xl p-3 border border-white/5">
                    &ldquo;{createdGema.message}&rdquo;
                  </p>
                )}
                <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider">
                  {createdGema.open_on ? `Dibuka ${formatGemaOpeningDate(createdGema.open_on)}` : createdGema.reveal_at}
                  {createdGema.sender ? ` · dari ${createdGema.sender}` : ' · dari seseorang'}
                </div>
              </div>

              <label className="block space-y-1 text-sm text-[var(--text-muted)]">
                <span>Tautan untuk penerima</span>
                <input
                  type="url"
                  readOnly
                  value={new URL(sharePath, window.location.origin).href}
                  onFocus={event => event.currentTarget.select()}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
              <button
                onClick={handleCopyLink}
                className="primary-action w-full"
              >
                Salin tautan gema <span aria-hidden="true">↗</span>
              </button>
              <a
                href={sharePath}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                Buka halaman Gema <span aria-hidden="true">↗</span>
              </a>
              {historySaved ? (
                <Link
                  href="/riwayat"
                  onClick={() => setIsModalOpen(false)}
                  className="block text-center text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Lihat riwayat Gema
                </Link>
              ) : (
                <p className="text-center text-sm text-[var(--text-muted)]">
                  Gema berhasil dibuat, tetapi riwayat tidak bisa disimpan di browser ini.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-bright border border-green-500/30 text-green-400 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl animate-fade-up flex items-center gap-2">
          <span className="text-green-400">✓</span>
          {toastMessage}
        </div>
      )}
    </>
  );
}
