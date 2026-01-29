'use client';

import React, { useState } from 'react';
import { useBudget } from '@/contexts/budget-context';
import type { Transaction } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditTransactionDialog } from '@/components/edit-transaction-dialog';
import { TransactionReceiptDialog } from './transaction-receipt-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MoreHorizontal, User, Tag } from 'lucide-react';

const TransactionListItem = ({ transaction }: { transaction: Transaction }) => {
  const { getCategoryByName, deleteTransaction } = useBudget();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const category = getCategoryByName(transaction.category || '');
  const isEtransfer =
    transaction.type === 'e-transfer-send' ||
    transaction.type === 'e-transfer-receive';
  const isExpense = ['expense', 'e-transfer-send'].includes(transaction.type);
  const Icon = isEtransfer ? User : category?.icon || Tag;
  const detailText = isEtransfer ? transaction.contact : category?.name;

  // Stop propagation so tapping menu doesn’t open receipt dialog
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex items-center p-3 sm:p-4 transition-colors hover:bg-muted/50 rounded-lg -m-1 sm:m-0">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="p-3 bg-muted rounded-full">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm sm:text-base">
            {transaction.description || 'N/A'}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground capitalize">
            {detailText || 'Uncategorized'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-2">
        <div
          className={cn(
            'font-medium text-right text-sm sm:text-base',
            isExpense ? '' : 'text-primary'
          )}
        >
          <div>
            {isExpense ? '-' : '+'}
            {formatCurrency(transaction.amount)}
          </div>
          <p className="text-xs text-muted-foreground font-normal sm:hidden">
            {format(new Date(transaction.date), 'MMM d')}
          </p>
        </div>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleTriggerClick}>
              <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <EditTransactionDialog transaction={transaction}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </EditTransactionDialog>

              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={() => {
                  setDeleteOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: 'destructive' })}
                onClick={async (e) => {
                  e.preventDefault();
                  await deleteTransaction(transaction.id);
                  setDeleteOpen(false);
                  (document.activeElement as HTMLElement | null)?.blur();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [filter, setFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((t) =>
    (t.description || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search transactions..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No transactions found.
              </p>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionReceiptDialog
                  key={transaction.id}
                  transaction={transaction}
                  open={selectedTransaction?.id === transaction.id}
                  onOpenChange={(open) =>
                    setSelectedTransaction(open ? transaction : null)
                  }
                >
                  <div
                    onClick={() => setSelectedTransaction(transaction)}
                    className="cursor-pointer"
                  >
                    <TransactionListItem transaction={transaction} />
                  </div>
                </TransactionReceiptDialog>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
