'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { GemaCreatedDate } from '@/components/gema-created-date';
import { TrackPlayer } from '@/components/track-player';
import type { Gema, LockedGema } from '@/types';
import { getGemaBySlug } from '@/lib/api';
import { appleMusicEmbedUrl } from '@/lib/apple-music';
import { formatGemaOpeningDate } from '@/lib/gema-opening-date';

function GemaDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [gema, setGema] = useState<Gema | LockedGema | null>(null);
  const [loading, setLoading] = useState(true);
  const [legacySong, setLegacySong] = useState<{ slug: string; url: string } | null>(null);

  useEffect(() => {
    if (slug) {
      getGemaBySlug(slug)
        .then(data => setGema(data))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    if (!gema || 'locked' in gema || (gema.slug !== slug && gema.id !== Number(slug))
      || gema.spotify_id || appleMusicEmbedUrl(gema.apple_music_url)) return;

    const controller = new AbortController();
    const term = `${gema.track_title} ${gema.track_artist}`.slice(0, 100);
    const normalize = (value: string) => value.normalize('NFKC').trim().toLowerCase();

    fetch(`/api/music-search?${new URLSearchParams({ q: term })}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then((response: { data: Array<{ title: string; artist: string; apple_music_url?: string }> } | null) => {
        const match = response?.data.find(track =>
          normalize(track.title) === normalize(gema.track_title)
          && normalize(track.artist) === normalize(gema.track_artist)
          && appleMusicEmbedUrl(track.apple_music_url)
        );
        if (!controller.signal.aborted && match?.apple_music_url) {
          setLegacySong({ slug, url: match.apple_music_url });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [gema, slug]);

  if (loading) {
    return (
      <div className="min-h-screen detail-shell flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm text-[var(--text-muted)]">Membuka gema untukmu...</p>
        </div>
      </div>
    );
  }

  if (!gema) {
    return (
      <div className="min-h-screen detail-shell flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[var(--card)] flex items-center justify-center text-2xl">
          ☾
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gema Tidak Ditemukan</h1>
          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            Mungkin tautan ini sudah kadaluarsa atau ada kesalahan pada penulisan alamat tautan.
          </p>
        </div>
        <Link
          href="/"
          className="primary-action"
        >
          Kembali ke Ruang Biru
        </Link>
      </div>
    );
  }

  if ('locked' in gema) {
    return (
      <div className="detail-shell flex min-h-screen flex-col p-6 sm:p-12">
        <header><Link href="/" className="inline-flex"><BrandLogo /></Link></header>
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
          <div className="relative mx-auto aspect-square w-36 sm:w-44" aria-hidden="true">
            <div className="record-disc detail-disc"><span>rb</span></div>
          </div>
          <p className="text-sm font-semibold text-[var(--accent)]">Gema untuk {gema.recipient}</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Gema ini belum bisa dibuka</h1>
          <p className="text-[var(--text-muted)]">
            Lagu dan pesan akan tersedia pada <time dateTime={gema.open_on} className="font-semibold text-white">
              {formatGemaOpeningDate(gema.open_on)}
            </time> pukul 00.00 WIB.
          </p>
          <button type="button" className="primary-action" onClick={() => window.location.reload()}>Cek lagi</button>
        </main>
      </div>
    );
  }

  const appleMusicUrl = appleMusicEmbedUrl(gema.apple_music_url)
    ? gema.apple_music_url
    : legacySong?.slug === slug ? legacySong.url : null;
  const providerUrl = gema.spotify_url || appleMusicUrl;
  const original = gema.original_gema;

  return (
    <div className="min-h-screen detail-shell text-[var(--text)] flex flex-col justify-between p-6 sm:p-12">
      {/* Header */}
      <header>
        <Link href="/" className="inline-flex items-center">
          <BrandLogo />
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto w-full py-12 text-center space-y-8">
        <div className="relative mx-auto aspect-square w-44 sm:w-56" aria-hidden="true">
          <div className="record-disc detail-disc"><span>rb</span></div>
        </div>

        {/* Message Headings */}
        <div className="space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--accent)]">
            SEBUAH GEMA UNTUKMU
          </span>
          <h1 className="mx-auto max-w-[24ch] text-3xl font-extrabold tracking-tight text-balance wrap-anywhere sm:text-4xl">
            {gema.title.startsWith('Untuk ') ? (
              <>
                <span className="text-xl font-medium text-[var(--text-muted)] sm:text-2xl">Untuk</span>{' '}
                <span className="font-serif font-semibold tracking-normal">{gema.title.slice('Untuk '.length)}</span>
              </>
            ) : gema.title}
          </h1>
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--card)] text-sm font-semibold border border-white/15">
            {gema.track_title} · <span className="text-[var(--text-muted)]">{gema.track_artist}</span>
          </div>
          <GemaCreatedDate createdAt={gema.created_at} />
        </div>

        <TrackPlayer spotifyId={gema.spotify_id} appleMusicUrl={appleMusicUrl} />
        {(!gema.spotify_id || gema.spotify_url) && (
          <a
            href={providerUrl || `https://music.apple.com/id/search?term=${encodeURIComponent(`${gema.track_title} ${gema.track_artist}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-action"
          >
            {gema.spotify_url ? 'Buka di Spotify' : appleMusicUrl ? 'Buka di Apple Music' : 'Cari di Apple Music'} <span aria-hidden="true">↗</span>
          </a>
        )}

        {/* Personalized Message Card */}
        {gema.message && (
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-sm text-left space-y-4">
            <span className="text-3xl font-serif text-[var(--accent)]">“</span>
            <p className="-mt-4 max-w-prose font-serif text-lg text-pretty leading-relaxed wrap-anywhere whitespace-pre-wrap italic text-[var(--text)] sm:text-xl">
              {gema.message}
            </p>
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
              <span>Dari: <strong>{gema.sender || 'Seseorang'}</strong></span>
              <span>Waktu tiba: <strong>{gema.open_on ? formatGemaOpeningDate(gema.open_on) : gema.reveal_at}</strong></span>
            </div>
          </div>
        )}

        {original && (
          <section aria-labelledby="original-gema" className="glass space-y-4 rounded-3xl border border-white/15 p-6 text-left sm:p-8">
            <h2 id="original-gema" className="text-lg font-bold">Gema awal</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Dari {original.sender || 'Seseorang'} untuk {original.recipient}
            </p>
            <p className="font-semibold">{original.track_title} · {original.track_artist}</p>
            {original.message && (
              <blockquote className="font-serif text-lg whitespace-pre-wrap wrap-anywhere">
                &ldquo;{original.message}&rdquo;
              </blockquote>
            )}
            <TrackPlayer spotifyId={original.spotify_id} appleMusicUrl={original.apple_music_url} />
            <Link href={`/gema/${encodeURIComponent(original.slug)}`} className="inline-block text-sm font-semibold text-[var(--accent)] hover:underline">
              Buka Gema awal <span aria-hidden="true">↗</span>
            </Link>
          </section>
        )}

        <div className="pt-4">
          <Link
            href={`/?${new URLSearchParams({ reply: gema.slug })}#buat`}
            className="primary-action"
          >
            Balas dengan lagu <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--text-muted)] py-4">
        Ruang Biru — Tempat lagu menemukan orangnya.
      </footer>
    </div>
  );
}

export default function GemaDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen detail-shell flex items-center justify-center p-6">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <GemaDetailContent />
    </Suspense>
  );
}
