'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { TrackCover } from '@/components/track-cover';
import { getFeaturedGemas } from '@/lib/api';
import type { Gema } from '@/types';

export function FeaturedGemas() {
  const [featuredGemas, setFeaturedGemas] = useState<Gema[]>([]);
  const cardsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    getFeaturedGemas().then(setFeaturedGemas);
  }, []);

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards || featuredGemas.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) {
          target.setAttribute('data-visible', 'true');
          observer.unobserve(target);
        }
      }
    });

    for (const card of cards.children) observer.observe(card);
    return () => observer.disconnect();
  }, [featuredGemas]);

  return (
    <section id="jelajahi" aria-label="Gema pilihan" className="section-space">
      <ul ref={cardsRef} className="site-width grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {featuredGemas.map((gema, index) => (
          <li
            key={gema.id}
            className="min-w-0 motion-safe:data-[visible=true]:animate-[fadeUp_420ms_ease-out_both]"
            style={{ animationDelay: `${(index % 3) * 70}ms` }}
          >
            <Link
              href={`/gema/${encodeURIComponent(gema.slug)}`}
              className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-[var(--surface)] p-5 transition hover:border-[var(--accent)] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] motion-safe:hover:-translate-y-1 sm:p-6"
            >
              <div className="space-y-3 wrap-anywhere">
                <p className="text-sm text-[var(--text-muted)]">
                  Untuk <span className="font-serif text-base font-semibold text-white">{gema.recipient}</span>
                </p>
                {gema.message && (
                  <blockquote className="font-serif text-xl leading-snug text-white">
                    &ldquo;{gema.message}&rdquo;
                  </blockquote>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-white/15 pt-4">
                <TrackCover src={gema.cover_url} className="size-11 rounded-lg" />
                <div className="min-w-0 flex-1 wrap-anywhere">
                  <p className="text-sm font-semibold text-white">{gema.track_title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{gema.track_artist}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-sm text-[var(--accent)] transition-colors group-hover:bg-white/10"
                >
                  ↗
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
