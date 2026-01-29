'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ProjectionChartProps {
    data: { year: number; value: number }[];
}

const chartConfig = {
  savings: {
    label: 'Savings',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function ProjectionChart({ data }: ProjectionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No data to display.</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full">
       <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `Age ${value}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrency(Number(value) / 1000) + 'k'}
            />
            <Tooltip
              cursor={{
                stroke: 'hsl(var(--border))',
                strokeWidth: 2,
                strokeDasharray: '3 3',
              }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <>
                      <div className="font-medium">{`Age ${item.payload.year}`}</div>
                      <div>{`Projected Savings: ${formatCurrency(Number(value))}`}</div>
                    </>
                  )}
                  indicator="dot"
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-savings)"
              strokeWidth={2}
              dot={false}
              name="Savings"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
