'use client';

import { useState, useEffect } from 'react';
import { useBudget } from '@/contexts/budget-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import type { BudgetItem } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2 } from 'lucide-react';

export function BudgetManager() {
  const { budgets, updateBudgets, categories, savingBudgets } = useBudget();
  const [localBudgets, setLocalBudgets] = useState<BudgetItem[]>([]);

  useEffect(() => {
    // Initialize local budgets by merging existing budgets with all available expense categories
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const initialLocalBudgets = expenseCategories.map(cat => {
      const existingBudget = budgets.find(b => b.category === cat.id);
      return existingBudget || { category: cat.id, amount: 0 };
    });
    setLocalBudgets(initialLocalBudgets);
  }, [budgets, categories]);

  const handleBudgetChange = (category: string, amount: string) => {
    const newAmount = parseFloat(amount) || 0;
    setLocalBudgets(
      localBudgets.map(b => (b.category === category ? { ...b, amount: newAmount } : b))
    );
  };
  
  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || id;
  };
  
  const getCategoryIcon = (id: string) => {
    const Icon = categories.find(c => c.id === id)?.icon;
    return Icon ? <Icon className="h-5 w-5 mr-3 text-muted-foreground" /> : null;
  }

  const handleSaveChanges = () => {
    updateBudgets(localBudgets);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Manage Budgets</CardTitle>
          <CardDescription>
            Enter the maximum amount you want to spend in each category per month.
          </CardDescription>
        </div>
        <Button onClick={handleSaveChanges} disabled={savingBudgets} className="shrink-0">
            {savingBudgets && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {savingBudgets ? 'Saving...' : 'Save Changes'}
          </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[55vh]">
          <div className="space-y-4 pr-6">
            {localBudgets.map(budget => (
              <div key={budget.category} className="flex flex-col items-stretch gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:p-0">
                 <div className="flex items-center">
                  {getCategoryIcon(budget.category)}
                  <Label htmlFor={`budget-${budget.category}`} className="capitalize text-base">
                    {getCategoryName(budget.category)}
                  </Label>
                </div>
                <div className='relative'>
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id={`budget-${budget.category}`}
                    type="number"
                    value={budget.amount}
                    onChange={e => handleBudgetChange(budget.category, e.target.value)}
                    className="w-full text-right pl-6 sm:w-40"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
