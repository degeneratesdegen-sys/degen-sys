'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UserSwitcher } from './user-switcher';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/90 px-4 backdrop-blur-sm sm:px-6 transition-all',
        scrolled ? 'shadow-sm' : 'shadow-none'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between transition-all',
          scrolled ? 'h-12' : 'h-14'
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'translate-y-2 transition-transform',
            scrolled ? 'translate-y-1' : 'translate-y-2'
          )}
          aria-label="Go to dashboard"
        >
          <Logo className={cn('h-11 w-auto scale-[2] transition-transform', scrolled ? 'scale-[1.85]' : 'scale-[2]')} />
        </Link>

        <UserSwitcher />
      </div>
    </header>
  );
}
