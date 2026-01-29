'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
    Repeat,
  Plus,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionDialog } from './add-transaction-dialog';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  null, // Placeholder for the Add button
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background">
      <div className="grid h-16 grid-cols-5 items-center">
        {navItems.map((item, index) => {
          if (!item) {
            return (
              <div key={index} className="flex justify-center">
                <div className="relative -mt-8">
                  <AddTransactionDialog>
                    <Button
                      size="icon"
                      className="h-14 w-14 rounded-full shadow-lg"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="sr-only">Add Transaction</span>
                    </Button>
                  </AddTransactionDialog>
                </div>
              </div>
            );
          }

          const { href, label, icon: Icon } = item;
          
          let isActive;
          if (href === '/tools') {
            isActive = pathname.startsWith('/tools') || pathname.startsWith('/budgets') || pathname.startsWith('/cash-flow') || pathname.startsWith('/settings') || pathname.startsWith('/insights') || pathname.startsWith('/plan-for-retirement');
          } else {
            isActive = pathname.startsWith(href);
          }
          
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span
                className={cn(
                  'text-[10px] font-medium sm:text-xs',
                  isActive && 'text-primary'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
