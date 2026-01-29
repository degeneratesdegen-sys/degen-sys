'use client';
import { useBudget } from '@/contexts/budget-context';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle, Package } from 'lucide-react';
import { DataTable } from '@/components/transactions/data-table';
import { columns } from '@/components/transactions/columns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';
import { Transaction } from '@/lib/types';


const PageSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-24" />
         <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="rounded-md border">
                <div className="p-2 space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        </div>
    </div>
)

const TransactionStats = () => {
    const { transactions } = useBudget();
    const monthlyTransactionCount = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        }).length;
    }, [transactions]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Transactions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{monthlyTransactionCount}</div>
            </CardContent>
        </Card>
    );
}

export default function TransactionsPage() {
  const { transactions, loading } = useBudget();
  return (
    <div className="space-y-4">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Transactions</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all your income and expenses.
          </p>
        </div>
        <AddTransactionDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </AddTransactionDialog>
      </div>
      {loading ? <PageSkeleton /> : (
          <div className="space-y-4">
            <TransactionStats />
            <DataTable columns={columns} data={transactions} />
          </div>
      )}
    </div>
  );
}
