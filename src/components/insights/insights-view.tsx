'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sparkles,
  Bot,
  TrendingDown,
  Lightbulb,
  BarChartHorizontal,
  FileText,
} from 'lucide-react';
import { useBudget } from '@/contexts/budget-context';
import {
  getSpendingInsights,
  type SpendingInsightsOutput,
} from '@/ai/flows/spending-suggestions.flow';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '../ui/separator';

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export function InsightsView() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<SpendingInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { transactions, budgets, getCategoryByName } = useBudget();

  const handleFetchInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);

    const monthlyBudget = budgets.reduce(
      (total, budget) => total + budget.amount,
      0
    );

    // Filter transactions for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = transactions.filter(
      (t) => new Date(t.date) > thirtyDaysAgo
    );

    if (recentTransactions.length < 5) {
      setError("You need at least 5 transactions in the last 30 days to generate insights.");
      setLoading(false);
      return;
    }

    const transactionsForAI = recentTransactions.map((t) => ({
      date: t.date,
      amount: t.amount,
      description: t.description,
      category: t.category ? getCategoryByName(t.category)?.name : undefined,
    }));

    try {
      const result = await getSpendingInsights({
        transactions: transactionsForAI,
        monthlyBudget,
      });
      setInsights(result);
    } catch (e) {
      console.error(e);
      setError(
        "Sorry, I couldn't generate insights at this time. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!loading && !insights && (
        <Card className="text-center p-8 flex flex-col items-center justify-center">
          <Lightbulb className="h-12 w-12 text-accent mb-4" />
          <p className="text-muted-foreground max-w-md mb-6">
            Ready to find some savings? Click the button below and our AI will
            analyze your recent transaction history to find trends and opportunities.
          </p>
          <Button onClick={handleFetchInsights} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? 'Analyzing...' : 'Generate My Insights'}
          </Button>
        </Card>
      )}

      {loading && <InsightsSkeleton />}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {insights && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>
                  A brief overview of your spending this month.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{insights.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChartHorizontal className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>
                  Where most of your money went this month.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.topSpendingCategories.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium capitalize">{cat.category}</span>
                    <span className="font-mono">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Actionable Suggestions
            </h3>
            {insights.suggestions.map((item, index) => (
              <Alert key={index}>
                <TrendingDown className="h-4 w-4" />
                <AlertTitle className="capitalize">{item.category}</AlertTitle>
                <AlertDescription>
                  {item.suggestion}
                  {item.potentialSavings && (
                    <div className="mt-2 font-medium text-primary">
                      Potential Savings: {formatCurrency(item.potentialSavings)}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
           <Separator className="my-6" />
           <div className="text-center">
             <Button variant="outline" onClick={handleFetchInsights} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" />
                {loading ? 'Re-analyzing...' : 'Generate Again'}
              </Button>
           </div>
        </div>
      )}
    </div>
  );
}
