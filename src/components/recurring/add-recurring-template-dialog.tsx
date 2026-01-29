'use client';

import * as React from 'react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { useFirestore } from '@/firebase';

import { addDoc, collection } from 'firebase/firestore';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export function AddRecurringTemplateDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const reset = () => {
    setName('');
    setAmount('');
    setCategory('');
    setFrequency('monthly');
  };

  const onSave = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not signed in', description: 'Please sign in first.' });
      return;
    }
    const amt = Number(amount);
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Missing name', description: 'Enter a bill/subscription name.' });
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Enter a valid amount > 0.' });
      return;
    }
    if (!category.trim()) {
      toast({ variant: 'destructive', title: 'Missing category', description: 'Enter a category (e.g., Utilities).' });
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'recurringTemplates'), {
        name: name.trim(),
        amount: amt,
        category: category.trim(),
        frequency,
        startDate: startDate,
        endDate: null,
        autopost: false,
        status: 'active',
        by: user.uid,
        createdAt: Date.now(),
      });

      toast({ title: 'Recurring payment created' });
      setOpen(false);
      reset();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Could not save', description: e?.message ?? 'Unknown error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Recurring Payment</DialogTitle>
          <DialogDescription>
            Creates a recurring template. Instances will generate automatically for the next 90 days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bill Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spotify, Electric Bill…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="12.99"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Utilities, Subscriptions…" />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
