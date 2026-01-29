'use client';

import { BudgetProvider } from '@/contexts/budget-context';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { useUser } from '@/contexts/user-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <BudgetProvider>
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 pb-24">{children}</main>
        <BottomNav />
      </div>
    </BudgetProvider>
  );
}
