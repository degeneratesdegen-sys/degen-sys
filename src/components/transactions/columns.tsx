'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpDown, MoreHorizontal, User, Tag } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useBudget } from '@/contexts/budget-context';
import { EditTransactionDialog } from '@/components/edit-transaction-dialog';
import { cn } from '@/lib/utils';

const ActionsCell = ({ row }: { row: any }) => {
  const transaction = row.original;
  const { deleteTransaction } = useBudget();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(transaction.id)}
          >
            Copy transaction ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <EditTransactionDialog transaction={transaction}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </EditTransactionDialog>

          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
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
    </>
  );
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{format(new Date(row.original.date), 'MMM d, yyyy')}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Details',
    cell: ({ row }) => {
      const { getCategoryByName } = useBudget();
      const transaction = row.original;

      const isEtransfer =
        transaction.type === 'e-transfer-send' ||
        transaction.type === 'e-transfer-receive';

      const category = getCategoryByName(transaction.category || '');
      const detailText = isEtransfer ? transaction.contact : category?.name;
      const Icon = isEtransfer ? User : category?.icon || Tag;

      return (
        <div>
          <p className="font-medium truncate max-w-[250px]">
            {transaction.description || 'N/A'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
            {Icon && <Icon className="h-3 w-3" />}
            <span>{detailText || 'Uncategorized'}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const { amount, type } = row.original;
      const formattedAmount = formatCurrency(amount);
      const isExpense = ['expense', 'e-transfer-send'].includes(type);

      return (
        <div
          className={cn(
            'text-right font-medium',
            isExpense ? '' : 'text-primary'
          )}
        >
          {isExpense ? `- ${formattedAmount}` : `+ ${formattedAmount}`}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ActionsCell,
  },
];
