'use client';

import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useBudget } from '@/contexts/budget-context';
import { format, subMonths } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Transaction } from '@/lib/types';

export function IncomeVsExpenseChart() {
  const { transactions } = useBudget();

  const chartData = useMemo(() => {
    const data: { [key: string]: { month: string; income: number; expenses: number } } = {};
    const incomeTypes: Transaction['type'][] = ['income', 'e-transfer-receive'];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM yyyy');
      data[monthKey] = { month: format(date, 'MMM'), income: 0, expenses: 0 };
    }

    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = format(date, 'MMM yyyy');
      if (data[monthKey]) {
        if (incomeTypes.includes(t.type)) {
          data[monthKey].income += t.amount;
        } else {
          data[monthKey].expenses += t.amount;
        }
      }
    });

    return Object.values(data);
  }, [transactions]);
  
  const chartConfig = {
    income: {
      label: 'Income',
      color: 'hsl(var(--chart-1))',
    },
    expenses: {
      label: 'Expenses',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  if (chartData.every(d => d.income === 0 && d.expenses === 0)) {
     return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Not enough data to display trend.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} tickLine={false} axisLine={false} />
            <Tooltip
              content={<ChartTooltipContent
                formatter={(value, name) => `${name.toString().charAt(0).toUpperCase() + name.slice(1)}: ${formatCurrency(Number(value))}`}
                indicator="dot"
              />}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
