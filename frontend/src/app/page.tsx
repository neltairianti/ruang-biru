import Link from 'next/link';
import { Suspense } from 'react';
import { getGemaBySlug } from '@/lib/api';
import { FeaturedGemas } from './featured-gemas';
import { HeroSection } from './hero-section';
import { HowItWorks } from './how-it-works';
import { NavBar } from './navbar';
import { StudioGema } from './studio-gema';

type HomeProps = { searchParams: Promise<{ reply?: string | string[] }> };

async function Studio({ searchParams }: HomeProps) {
  const { reply } = await searchParams;
  if (!reply) return <StudioGema key="new" />;

  const original = typeof reply === 'string' && reply.length <= 255
    ? await getGemaBySlug(reply)
    : null;

  if (!original || 'locked' in original || original.slug !== reply) {
    return (
      <section id="buat" className="section-space">
        <div className="site-width space-y-4">
          <p>Gema awal belum bisa dibalas atau sudah tidak tersedia.</p>
          <Link href="/#buat" className="primary-action">Buat Gema baru</Link>
        </div>
      </section>
    );
  }

  const { slug, sender, track_title, track_artist } = original;
  return <StudioGema key={slug} replyTo={{ slug, sender, track_title, track_artist }} />;
}

export default function Home({ searchParams }: HomeProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <NavBar />
      <main>
        <HeroSection />
        <HowItWorks />

        <Suspense fallback={<section id="buat" className="section-space"><p className="site-width" role="status">Memuat form Gema…</p></section>}>
          <Studio searchParams={searchParams} />
        </Suspense>
        <FeaturedGemas />

        <section className="section-space relative overflow-hidden" style={{ background: 'var(--surface)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 65%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-violet-600/8 blur-3xl animate-glow-pulse pointer-events-none" />

          <div className="relative max-w-3xl mx-auto px-6 text-center space-y-8">
            <span className="block text-xs font-bold tracking-widest uppercase text-[var(--accent)]">
              Sebuah pesan bisa jadi lagu
            </span>
            <h2 className="mx-auto max-w-[22ch] text-4xl font-black tracking-tight text-balance sm:text-6xl">
              Siapa yang pertama kali <span className="gradient-text italic font-serif font-normal">terlintas?</span>
            </h2>
            <p className="mx-auto max-w-[42ch] text-pretty leading-relaxed text-[var(--text-muted)]">
              Jangan biarkan perasaan itu hanya jadi draft yang tak pernah terkirim.
            </p>
            <a
              href="#buat"
              className="primary-action"
            >
              Kirim gema untuk mereka
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8">
        <div className="site-width flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-dim)]">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 opacity-70" />
              <div className="absolute inset-0 rounded-full flex items-center justify-center font-black text-[9px] text-white">rb</div>
            </div>
            <span className="text-[var(--text-muted)]">ruang<span className="text-white">biru</span> — Tempat lagu menemukan orangnya.</span>
          </div>
          <span>© 2026 Ruang Biru</span>
        </div>
      </footer>
    </div>
  );
}
