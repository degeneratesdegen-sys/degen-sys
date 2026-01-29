import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SpendingByCategoryChart } from '@/components/reports/spending-by-category-chart';
import { IncomeVsExpenseChart } from '@/components/reports/income-vs-expense-chart';

export default function ReportsPage() {
  return (
    <div className="space-y-4">
       <div>
        <h1 className="text-2xl font-bold font-headline">Reports</h1>
        <p className="text-muted-foreground text-sm">
          Visualize your spending habits and financial progress.
        </p>
      </div>

      <Tabs defaultValue="spending-by-category">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spending-by-category">Spending by Category</TabsTrigger>
          <TabsTrigger value="income-vs-expense">Income vs. Expense</TabsTrigger>
        </TabsList>
        <TabsContent value="spending-by-category">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                A breakdown of your expenses for the current month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingByCategoryChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="income-vs-expense">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expense</CardTitle>
              <CardDescription>
                Your total income and expenses over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeVsExpenseChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
