'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBudget } from '@/contexts/budget-context';
import { format } from 'date-fns';
import { Textarea } from './ui/textarea';
import type { Transaction } from '@/lib/types';

const formSchema = z
  .object({
    type: z.enum(['income', 'expense', 'e-transfer-send', 'e-transfer-receive']),
    amount: z.coerce.number().positive('Amount must be positive'),
    category: z.string().optional(),
    contact: z.string().optional(),
    date: z.date(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.type === 'income' || data.type === 'expense') && !data.category) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message: 'Please select a category',
      });
    }
    if (
      (data.type === 'e-transfer-send' || data.type === 'e-transfer-receive') &&
      !data.contact
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['contact'],
        message: 'Please enter a contact name.',
      });
    }
  });

interface EditTransactionDialogProps {
  transaction: Transaction;
  children: React.ReactNode;
}

export function EditTransactionDialog({
  transaction,
  children,
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateTransaction, categories } = useBudget();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      contact: transaction.contact,
      date: new Date(transaction.date),
      description: transaction.description,
    },
  });

  const transactionType = form.watch('type');

  useEffect(() => {
    form.resetField('category');
    form.resetField('contact');
  }, [transactionType, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateTransaction(transaction.id, {
      ...values,
      date: values.date.toISOString(),
      description: values.description || '',
    });
    setOpen(false);
  }

  const isEtransfer =
    transactionType === 'e-transfer-send' ||
    transactionType === 'e-transfer-receive';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit transaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="e-transfer-send">
                        E-Transfer Send
                      </SelectItem>
                      <SelectItem value="e-transfer-receive">
                        E-Transfer Receive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEtransfer ? (
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {transactionType === 'e-transfer-send' ? 'To' : 'From'}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((cat) => {
                            if (transactionType === 'income') {
                                return cat.type === 'income';
                            }
                            return cat.type === 'expense';
                          })
                          .map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <span>{cat.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        if (dateValue) {
                           // Appending T00:00:00 ensures the date is parsed in the user's local timezone,
                          // preventing off-by-one-day errors that can occur with new Date('YYYY-MM-DD').
                          const date = new Date(`${dateValue}T00:00:00`);
                          field.onChange(date);
                        } else {
                          field.onChange(null);
                        }
                      }}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Coffee with friends"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
