'use client';

import { useBudget } from '@/contexts/budget-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
import { PlusCircle, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { CategoryFormDialog } from './category-form-dialog';
import { buttonVariants } from '../ui/button';
import type { Category } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

function CategoryListItem({ category }: { category: Category }) {
  const { deleteCategory } = useBudget();
  const Icon = category.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="capitalize">{category.name}</span>
        {category.type === 'income' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This is an income category.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-2">
        <CategoryFormDialog category={category}>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        </CategoryFormDialog>
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
                This will permanently delete the "{category.name}" category. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: 'destructive' })}
                onClick={() => deleteCategory(category.id)}
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

export function CategoryManager() {
  const { categories } = useBudget();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>
            Add, edit, or delete your spending and income categories.
          </CardDescription>
        </div>
        <CategoryFormDialog>
          <Button className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CategoryFormDialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            {categories.length > 0 ? (
                categories.map(cat => <CategoryListItem key={cat.id} category={cat} />)
            ) : (
                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                    <p>You haven't added any categories yet.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
