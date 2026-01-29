'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export default function NewRecurringTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

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

  const onSave = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not signed in',
        description: 'Please sign in first.',
      });
      return;
    }

    const amt = Number(amount);
    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing name',
        description: 'Enter a bill/subscription name.',
      });
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Enter a valid amount > 0.',
      });
      return;
    }
    if (!category.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing category',
        description: 'Enter a category (e.g., Utilities).',
      });
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
      router.push('/recurring');
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Could not save',
        description: e?.message ?? 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-headline">Add Recurring Payment</h1>
        <p className="text-muted-foreground text-sm">Create a recurring template.</p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bill Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spotify, Electric Bill…"
            />
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
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Utilities, Subscriptions…"
            />
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

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/recurring')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
