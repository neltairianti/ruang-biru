export function HowItWorks() {
  const steps = [
    { no: '01', icon: '♫', title: 'Pilih lagunya', desc: 'Cari lagu yang mewakili sesuatu yang sulit kamu ucapkan.', color: 'from-violet-500/30 to-purple-500/30' },
    { no: '02', icon: '✎', title: 'Titipkan ceritamu', desc: 'Satu kalimat, kenangan kecil, atau petunjuk untuk ditebak.', color: 'from-cyan-500/30 to-teal-500/30' },
    { no: '03', icon: '◷', title: 'Tentukan momennya', desc: 'Kirim sekarang atau biarkan pesanmu tiba di hari yang kamu pilih.', color: 'from-rose-500/30 to-pink-500/30' },
  ];

  return (
    <section id="cara-kerja" className="section-space relative" style={{ background: 'var(--paper)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)' }} />
      <div className="site-width">
        <div className="text-center mb-10 sm:mb-14 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--accent)]">Lebih dari berbagi tautan</span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
            Lagu punya cerita.<br />
            <span className="gradient-text italic font-serif font-normal">Biarkan terasa.</span>
          </h2>
          <p className="mx-auto max-w-[48ch] text-pretty leading-relaxed text-[var(--text-muted)]">
            Sebuah gema adalah lagu yang dibungkus dalam konteks darimu—dan dibuka dengan cara yang mereka pilih.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 hidden lg:block w-[60%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {steps.map((step, i) => (
              <div
                key={step.no}
                className="relative group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="glass rounded-3xl p-8 h-full border border-white/5 hover:border-white/15 transition-all duration-300 group-hover:-translate-y-2">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <span className="text-xs font-mono text-[var(--text-dim)] font-bold">{step.no}</span>
                      <div className="w-12 h-12 rounded-2xl glass-bright flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="max-w-prose text-sm text-pretty leading-relaxed text-[var(--text-muted)]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
