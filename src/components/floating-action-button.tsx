'use client';

import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <AddTransactionDialog>
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Transaction</span>
        </Button>
      </AddTransactionDialog>
    </div>
  );
}
