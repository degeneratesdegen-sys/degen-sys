'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBudget } from '@/contexts/budget-context';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentTransactions() {
  const { transactions, getCategoryByName, loading } = useBudget();

  if (loading) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Loading your latest transactions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="ml-auto h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentTransactions.length === 0) {
     return (
       <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your most recent transactions will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Transactions Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Add your first transaction to get started.</p>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/transactions">Add First Transaction</Link>
            </Button>
        </CardContent>
      </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your 5 most recent transactions. Click any to see all.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {recentTransactions.map(t => {
            const category = getCategoryByName(t.category);
            const Icon = category?.icon;
            return (
              <Link href="/transactions" key={t.id} className="block -m-2 rounded-lg">
                <div className="flex items-center p-2 transition-colors hover:bg-muted/50 rounded-lg">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={t.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>
                      {Icon ? <Icon className="h-4 w-4" /> : t.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{t.description}</p>
                    <p className="text-sm text-muted-foreground capitalize">{category?.name || t.category}</p>
                  </div>
                  <div className={`ml-auto font-medium text-sm ${t.type === 'income' ? 'text-primary' : ''}`}>
                    {t.type === 'expense' ? '-' : '+'}
                    {formatCurrency(t.amount)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
         <Button variant="outline" className="w-full mt-4" asChild>
          <Link href="/transactions">View All Transactions</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
