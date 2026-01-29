'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudget } from '@/contexts/budget-context';
import { formatCurrency } from '@/lib/utils';
import { Landmark, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/lib/types';

export function OverviewCards() {
  const { transactions, loading } = useBudget();

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const incomeTypes: Transaction['type'][] = ['income', 'e-transfer-receive'];
    const expenseTypes: Transaction['type'][] = ['expense', 'e-transfer-send'];

    let income = 0;
    let expenses = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      const transactionDate = new Date(t.date);
      const isCurrentMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;

      const amount = Number(t.amount) || 0;

      if (incomeTypes.includes(t.type)) {
        totalIncome += amount;
        if (isCurrentMonth) {
          income += amount;
        }
      } else if (expenseTypes.includes(t.type)) {
        totalExpenses += amount;
        if (isCurrentMonth) {
          expenses += amount;
        }
      }
    }

    const balance = totalIncome - totalExpenses;

    return { income, expenses, balance };
  }, [transactions]);
  
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.balance)}</div>
          <p className="text-xs text-muted-foreground">Your current net worth</p>
        </CardContent>
      </Card>
      <Link href="/transactions" className="block hover:shadow-md transition-shadow rounded-lg">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.income)}</div>
            <p className="text-xs text-muted-foreground">Earnings this month</p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/transactions" className="block hover:shadow-md transition-shadow rounded-lg">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.expenses)}</div>
            <p className="text-xs text-muted-foreground">Spending this month</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
