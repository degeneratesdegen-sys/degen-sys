'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/icon.png"
      alt="NestEgg"
      width={512}
      height={512}
      priority
      className={cn('h-9 w-auto', className)}
    />
  );
}
