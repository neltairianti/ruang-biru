import { RecipientSearch } from '@/components/recipient-search';

export function HeroSection() {
  return (
    <section id="home" className="hero">
      <div className="site-width hero-layout">
        <div className="min-w-0">
          <h1
            className="max-w-[13ch] text-[clamp(2.5rem,6.1vw,5.75rem)] leading-[0.98]
                       font-extrabold tracking-[-0.074em]"
          >
            Ada rasa yang lebih pas{' '}
            <em className="block font-serif font-normal tracking-[-0.055em] text-[var(--accent)]">
              didengar.
            </em>
          </h1>
          <p className="mt-5 max-w-[40ch] text-pretty leading-relaxed text-[var(--text-muted)] sm:text-lg">
            Titipkan lagu, ceritakan alasannya, lalu bagikan gema itu ke orang yang kamu tuju.
          </p>
          <div className="mt-6 max-w-md">
            <RecipientSearch />
          </div>
        </div>
        <div className="record-art" aria-hidden="true">
          <div className="record-sleeve"><span>ruang<br />biru.</span></div>
          <div className="record-disc"><span>rb</span></div>
        </div>
      </div>
    </section>
  );
}
