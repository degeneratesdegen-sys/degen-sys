import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChevronRight, Target, Repeat, LineChart, Lightbulb, PiggyBank } from 'lucide-react';

const tools = [
    {
        title: 'Budgets',
        description: 'Set and manage your monthly spending limits.',
        href: '/budgets',
        icon: Target,
    },
    {
        title: 'Recurring',
        description: 'Track your subscriptions and recurring payments.',
        href: '/recurring',
        icon: Repeat,
    },
    {
        title: 'Cash Flow',
        description: 'Analyze your income and expenses over time.',
        href: '/cash-flow',
        icon: LineChart,
    },
    {
        title: 'Insights',
        description: 'Get AI-powered insights into your spending.',
        href: '/insights',
        icon: Lightbulb,
    },
    {
        title: 'Plan for Retirement',
        description: 'Plan and save for your retirement goals.',
        href: '/plan-for-retirement',
        icon: PiggyBank,
    }
];

export default function ToolsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-headline">Tools</h1>
        <p className="text-muted-foreground text-sm">
          Explore additional tools to manage your finances.
        </p>
      </div>

      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link href={tool.href} key={tool.title} className="block">
              <Card className="hover:bg-muted/50 transition-colors">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold">{tool.title}</p>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
