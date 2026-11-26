'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { GemaCreatedDate } from '@/components/gema-created-date';
import { TrackCover } from '@/components/track-cover';
import { parseGemaHistory, readHistorySnapshot, subscribeToGemaHistory } from '@/lib/gema-history';
import { NavBar } from '../navbar';

const getServerSnapshot = () => null;

export default function RiwayatPage() {
  const snapshot = useSyncExternalStore(subscribeToGemaHistory, readHistorySnapshot, getServerSnapshot);
  const history = parseGemaHistory(snapshot ?? '');

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <NavBar />
      <main className="site-width pb-16 pt-28 sm:pt-36">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Riwayat Gema</h1>
        <p className="mt-3 text-[var(--text-muted)]">Gema yang kamu buat di browser ini.</p>

        {snapshot === null ? (
          <p role="status" className="mt-8 text-[var(--text-muted)]">Memuat riwayat…</p>
        ) : history.length === 0 ? (
          <div className="glass mt-8 space-y-4 rounded-3xl border border-white/10 p-6">
            <p className="text-[var(--text-muted)]">Belum ada Gema yang tersimpan di riwayat.</p>
            <Link href="/#buat" className="primary-action">Buat gema</Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {history.map(gema => (
              <li key={gema.slug}>
                <Link
                  href={`/gema/${encodeURIComponent(gema.slug)}`}
                  className="glass flex h-full items-center gap-4 rounded-3xl border border-white/10 p-5 transition-colors hover:border-violet-500/50"
                >
                  <TrackCover src={gema.cover_url} className="size-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-1 break-words">
                    <h2 className="font-bold">Untuk {gema.recipient}</h2>
                    <p className="text-sm text-[var(--text-muted)]">{gema.track_title} · {gema.track_artist}</p>
                    <GemaCreatedDate createdAt={gema.created_at} />
                  </div>
                  <span aria-hidden="true" className="text-[var(--accent)]">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
