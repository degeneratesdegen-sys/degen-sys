'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { BudgetStatus } from '@/components/dashboard/budget-status';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-4 pt-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s a snapshot of your financial health this month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/insights">
              <Lightbulb className="mr-2 h-4 w-4" />
              Get Insights
            </Link>
          </Button>
        </div>
      </div>

      <OverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BudgetStatus />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
