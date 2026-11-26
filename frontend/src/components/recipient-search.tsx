'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GemaCreatedDate } from '@/components/gema-created-date';
import { searchGemaRecipients, type RecipientMatch } from '@/lib/api';

type SearchResult = {
  query: string;
  matches: RecipientMatch[] | null;
};

export function RecipientSearch() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const query = input.trim();
  const current = result?.query === query ? result : null;

  useEffect(() => {
    if (query.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchGemaRecipients(query, controller.signal)
        .then(matches => {
          if (!controller.signal.aborted) setResult({ query, matches });
        })
        .catch(() => {
          if (!controller.signal.aborted) setResult({ query, matches: null });
        });
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  let status = 'Ketik minimal 2 karakter.';
  if (query.length >= 2) {
    if (!current) status = 'Mencari penerima…';
    else if (!current.matches) status = 'Pencarian sedang tidak tersedia. Coba lagi sebentar.';
    else if (current.matches.length === 0) status = 'Belum ada Gema untuk nama tersebut.';
    else status = `${current.matches.length} Gema ditemukan.`;
  }

  return (
    <div role="search" aria-label="Cari Gema berdasarkan nama penerima">
      <label htmlFor="recipient-search" className="mb-2 block text-sm font-semibold">
        Cari nama penerima
      </label>
      <input
        id="recipient-search"
        type="search"
        autoComplete="off"
        maxLength={50}
        placeholder="Ketik nama atau nama panggilan"
        value={input}
        onChange={event => {
          const value = event.target.value;
          if (value.trim() !== query) setResult(null);
          setInput(value);
        }}
        aria-describedby="recipient-search-status"
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      />
      <p id="recipient-search-status" role="status" className="mt-2 text-sm text-[var(--text-muted)]">{status}</p>
      {current?.matches && current.matches.length > 0 && (
        <ul className="recipient-search-results mt-3 grid max-h-72 gap-2 overflow-y-auto">
          {current.matches.map(gema => (
            <li key={gema.slug}>
              <Link href={`/gema/${encodeURIComponent(gema.slug)}`} prefetch={false} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5">
                <span className="min-w-0 break-words">
                  <span className="block">
                    <span className="text-sm text-[var(--text-muted)]">Untuk</span>{' '}
                    <span className="font-serif text-lg font-semibold text-white">{gema.recipient}</span>
                  </span>
                  <span className="block text-sm text-[var(--text-muted)]">{gema.track_title} · {gema.track_artist}</span>
                  <GemaCreatedDate createdAt={gema.created_at} />
                </span>
                <span aria-hidden="true" className="text-[var(--accent)]">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
