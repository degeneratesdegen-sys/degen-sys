'use client';

import { RecurringTransaction } from '@/lib/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useBudget } from '@/contexts/budget-context';
import { AddRecurringDialog } from './add-recurring-dialog';
import { EditRecurringDialog } from './edit-recurring-dialog';
import { formatCurrency } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

function RecurringListItem({ transaction }: { transaction: RecurringTransaction }) {
  const { deleteRecurringTransaction, getCategoryByName } = useBudget();
  const category = getCategoryByName(transaction.category);
  const Icon = category?.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-2 bg-muted rounded-md">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
                {formatCurrency(transaction.amount)} / {transaction.frequency}
            </p>
             <p className={cn("text-xs", isPast(new Date(transaction.nextDueDate)) ? "text-destructive font-medium" : "text-muted-foreground")}>
                Next payment: {format(new Date(transaction.nextDueDate), 'MMM d, yyyy')}
            </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <EditRecurringDialog transaction={transaction}>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        </EditRecurringDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the "{transaction.description}" recurring payment. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: 'destructive' })}
                onClick={() => deleteRecurringTransaction(transaction.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function RecurringManager() {
  const { recurringTransactions, loading } = useBudget();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Your Recurring Payments</CardTitle>
          <CardDescription>
            Manage your subscriptions and recurring bills.
          </CardDescription>
        </div>
        <AddRecurringDialog>
          <Button className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Recurring Payment
          </Button>
        </AddRecurringDialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : recurringTransactions.length > 0 ? (
           <div className="space-y-2">
            {recurringTransactions.sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()).map(t => (
                <RecurringListItem key={t.id} transaction={t} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
            <p>You haven't added any recurring payments yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
