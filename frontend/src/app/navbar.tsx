'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/brand-logo';

const navLinks = [
  { label: 'Cara kerja', href: '/#cara-kerja', className: 'hidden md:inline-flex' },
  { label: 'Jelajahi', href: '/#jelajahi' },
  { label: 'Riwayat', href: '/riwayat' },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/5 py-2 md:py-3' : 'py-3 md:py-5'}`}>
      <div className="site-width grid grid-cols-[1fr_auto] items-center gap-x-2 md:flex md:justify-between">
        <Link href="/#home" className="inline-flex items-center">
          <BrandLogo />
        </Link>

        <nav aria-label="Navigasi utama" className="col-span-2 row-start-2 flex items-center justify-center gap-1">
          {navLinks.map(({ label, href, className = '' }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-4 py-2 text-sm text-[var(--text-muted)] transition-all hover:bg-white/5 hover:text-white ${className}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link href="/#buat" className="primary-action col-start-2 row-start-1">
          Buat gema <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
