'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBudget } from '@/contexts/budget-context';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

export function BudgetStatus() {
  const { transactions, budgets, getCategoryByName, loading } = useBudget();

  const budgetProgress = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        ['expense', 'e-transfer-send'].includes(t.type) &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    return budgets.map(budget => {
      const spent = monthlyExpenses
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const categoryInfo = getCategoryByName(budget.category);
      
      return {
        ...budget,
        spent,
        percentage,
        icon: categoryInfo?.icon,
        name: categoryInfo?.name || budget.category,
      };
    }).sort((a,b) => b.percentage - a.percentage);
  }, [transactions, budgets, getCategoryByName]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>Your spending progress is loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>Track your spending against your goals.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-64">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Budgets Set</h3>
            <p className="text-muted-foreground text-sm mb-4">You haven't set any budgets yet. Get started now!</p>
            <Button asChild>
                <Link href="/budgets">Set Budgets</Link>
            </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
        <CardDescription>Your spending progress. Click any item to manage your budgets.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2 pr-4">
            {budgetProgress.map(item => (
              <Link href="/budgets" key={item.category} className="block rounded-lg -m-2">
                <div className="p-2 transition-colors hover:bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium capitalize">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(item.spent)} / {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <Progress value={item.percentage} className={item.percentage > 100 ? '[&>div]:bg-destructive' : ''}/>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
