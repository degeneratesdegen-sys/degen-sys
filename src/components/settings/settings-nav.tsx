'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Palette, Tags } from 'lucide-react';

const navItems = [
  {
    href: '/settings/appearance',
    title: 'Appearance',
    icon: Palette,
  },
  {
    href: '/settings/categories',
    title: 'Categories',
    icon: Tags,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                'flex items-center gap-2 justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                    ? 'bg-muted'
                    : 'hover:bg-muted/50',
                
                )}
            >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
            </Link>
          )
      })}
    </nav>
  );
}
