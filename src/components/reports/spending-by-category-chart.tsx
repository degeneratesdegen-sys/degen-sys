'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useBudget } from '@/contexts/budget-context';
import { formatCurrency } from '@/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export function SpendingByCategoryChart() {
  const { transactions, getCategoryByName } = useBudget();

  const chartData = useMemo(() => {
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

    const spendingByCategory: { [key: string]: number } = {};
    monthlyExpenses.forEach(t => {
      if (t.category) {
        if (!spendingByCategory[t.category]) {
          spendingByCategory[t.category] = 0;
        }
        spendingByCategory[t.category] += t.amount;
      }
    });

    return Object.entries(spendingByCategory)
      .map(([category, amount]) => ({
        category: getCategoryByName(category)?.name || category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, getCategoryByName]);

  const chartConfig = {
    amount: {
      label: 'Amount',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No expense data for this month to display.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
              />}
            />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
