import { BudgetManager } from '@/components/budgets/budget-manager';

export default function BudgetsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-headline">Budgets</h1>
        <p className="text-muted-foreground text-sm">
          Set and manage your monthly spending limits for each category.
        </p>
      </div>
      <BudgetManager />
    </div>
  );
}
