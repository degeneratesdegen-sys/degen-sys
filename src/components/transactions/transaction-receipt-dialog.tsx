'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';
import { useBudget } from '@/contexts/budget-context';
import { cn } from '@/lib/utils';
import { User, Tag } from 'lucide-react';

interface TransactionReceiptDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionReceiptDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionReceiptDialogProps) {
  const { getCategoryByName } = useBudget();

  if (!transaction) {
    return null;
  }

  const category = getCategoryByName(transaction.category || '');
  const isEtransfer =
    transaction.type === 'e-transfer-send' ||
    transaction.type === 'e-transfer-receive';
  const isExpense = ['expense', 'e-transfer-send'].includes(transaction.type);

  const detailLabel = isEtransfer
    ? transaction.type === 'e-transfer-send'
      ? 'To'
      : 'From'
    : 'Category';
    
  const detailValue = isEtransfer
    ? transaction.contact
    : category?.name;
    
  const DetailIcon = isEtransfer ? User : (category?.icon || Tag);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">
            Transaction Details
          </DialogTitle>
          <DialogDescription className="text-center">
            A receipt for your transaction on {format(new Date(transaction.date), 'PPP')}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className={cn('text-5xl font-bold font-headline', isExpense ? 'text-destructive' : 'text-primary')}>
              {isExpense ? '-' : '+'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
             <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium text-right">{transaction.description || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{detailLabel}</span>
              <div className="flex items-center gap-2 font-medium capitalize">
                <DetailIcon className="h-4 w-4 text-muted-foreground" />
                <span>{detailValue || 'N/A'}</span>
              </div>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction Type</span>
              <Badge
                variant={isExpense ? 'destructive' : 'default'}
                className={cn('capitalize', isExpense 
                  ? 'bg-destructive/10 text-destructive border-destructive/10 hover:bg-destructive/20' 
                  : 'bg-primary/20 text-primary border-primary/20 hover:bg-primary/30'
                )}
              >
                {transaction.type.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">{transaction.id}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
