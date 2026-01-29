'use client';

import { useMemo, useState } from 'react';
import { useBudget } from '@/contexts/budget-context';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2 } from 'lucide-react';
import { AddRecurringTemplateDialog } from '@/components/recurring/add-recurring-template-dialog';
import { parseISODate } from '@/lib/recurring';

function getPill(status: string) {
  const s = (status || 'scheduled').toLowerCase();
  if (s === 'paid')
    return {
      label: 'Paid',
      cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
  if (s === 'due')
    return {
      label: 'Due',
      cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
  if (s === 'overdue')
    return {
      label: 'Overdue',
      cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
  if (s === 'due-soon')
    return {
      label: 'Due Soon',
      cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
  return {
    label: 'Scheduled',
    cls: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  };
}

function computeStatus(instance: any) {
  const raw = String(instance?.status || 'scheduled').toLowerCase();
  if (raw === 'paid' || raw === 'skipped') return raw;

  const due = parseISODate(instance?.dueDate);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((+startOfDue - +startOfToday) / 86400000);

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due';
  if (diffDays <= 3) return 'due-soon';
  return 'scheduled';
}

type TabKey = 'upcoming' | 'past' | 'paused';

export default function RecurringPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const db = useFirestore();

  const { recurringTemplates, recurringInstances, loading } = useBudget() as any;
  const [tab, setTab] = useState<TabKey>('upcoming');


    const [deleteTarget, setDeleteTarget] = useState<{ templateId: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const doDelete = async () => {
      if (!user || !deleteTarget) return;
      setDeleting(true);
      try {
        const templateId = deleteTarget.templateId;

        // delete template
        await deleteDoc(doc(db, 'users', user.uid, 'recurringTemplates', templateId));

        // delete generated instances for this template (avoid orphan rows)
        const instRef = collection(db, 'users', user.uid, 'recurringInstances');
        const q = query(instRef, where('templateId', '==', templateId));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }

        toast({ title: 'Recurring payment deleted' });
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'Could not delete',
          description: e?.message ?? 'Unknown error',
        });
      } finally {
        setDeleting(false);
        setDeleteTarget(null);
      }
    };

  const [autoMarkPaid, setAutoMarkPaid] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('nestegg_auto_mark_paid') === 'true';
  });

  const persistAutoMarkPaid = (v: boolean) => {
    try {
      window.localStorage.setItem('nestegg_auto_mark_paid', String(!!v));
    } catch {}
  };

  const { upcoming, past, paused } = useMemo(() => {
    const templates: any[] = recurringTemplates || [];
    const instances: any[] = recurringInstances || [];
    const templateById = new Map<string, any>(templates.map((t) => [t.id, t]));

    const pausedTemplates = templates.filter((t) => t?.status === 'paused');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcomingInstances = instances
      .filter((i) => {
        const t = templateById.get(i.templateId);
        if (!t || t.status === 'paused') return false;
        const due = parseISODate(i.dueDate);
        return due >= startOfToday;
      })
      .sort((a, b) => +parseISODate(a.dueDate) - +parseISODate(b.dueDate));

    const pastInstances = instances
      .filter((i) => {
        const due = parseISODate(i.dueDate);
        return due < startOfToday;
      })
      .sort((a, b) => +parseISODate(b.dueDate) - +parseISODate(a.dueDate));

    return { upcoming: upcomingInstances, past: pastInstances, paused: pausedTemplates };
  }, [recurringTemplates, recurringInstances]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Recurring Payments</h1>
          <p className="text-muted-foreground text-sm">Showing next 30 days of payments.</p>
        </div>

        <Button className="shrink-0" onClick={() => (window.location.href = '/recurring/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {loading ? (
            <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
          ) : upcoming.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">
              No upcoming recurring payments yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map((i) => {
                const st = computeStatus(i);
                const pill = getPill(st);

                return (
                  <Card key={i.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl border bg-muted flex items-center justify-center text-sm font-semibold">
                          {String(i.name || 'R').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{i.name || 'Recurring Payment'}</div>
                          <div className="text-xs text-muted-foreground">
                            Due {parseISODate(i.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold">${Number(i.amountSnapshot ?? 0).toFixed(2)}</div>
                        <div
                          className={
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ' +
                            pill.cls
                          }
                        >
                          {pill.label}
                        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const tid = (i as any).templateId;
            if (!tid) return;
            setDeleteTarget({ templateId: String(tid), name: String(i.name || 'Recurring Payment') });
          }}
          disabled={!(i as any).templateId}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {loading ? (
            <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
          ) : past.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No past payments yet.</Card>
          ) : (
            <div className="space-y-3">
              {past.map((i) => {
                const st =
                  String(i.status || '').toLowerCase() === 'paid'
                    ? 'paid'
                    : 'overdue';
                const pill = getPill(st);

                return (
                  <Card key={i.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl border bg-muted flex items-center justify-center text-sm font-semibold">
                          {String(i.name || 'R').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{i.name || 'Recurring Payment'}</div>
                          <div className="text-xs text-muted-foreground">
                            Due {parseISODate(i.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold">${Number(i.amountSnapshot ?? 0).toFixed(2)}</div>
                        <div
                          className={
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ' +
                            pill.cls
                          }
                        >
                          {pill.label}
                        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const tid = (i as any).templateId;
            if (!tid) return;
            setDeleteTarget({ templateId: String(tid), name: String(i.name || 'Recurring Payment') });
          }}
          disabled={!(i as any).templateId}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-3">
          {loading ? (
            <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
          ) : paused.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No paused payments.</Card>
          ) : (
            <div className="space-y-3">
              {paused.map((t) => (
                <Card key={t.id} className="p-4">
                  <div className="flex items
 items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {t.name || 'Recurring Payment'}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {t.frequency || 'monthly'}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold">
                          ${Number(t.amount ?? 0).toFixed(2)}
                        </div>
                        <div className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium bg-slate-500/10 text-slate-600 border-slate-500/20">
                          Paused
                        </div>
                      </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDeleteTarget({ templateId: String(t.id), name: String(t.name || 'Recurring Payment') });
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Auto-Mark as Paid</Label>
              <p className="text-xs text-muted-foreground">
                Automatically mark recurring payments as paid on due date.
              </p>
            </div>
            <Switch
              checked={autoMarkPaid}
              onCheckedChange={(v) => {
                setAutoMarkPaid(v);
                persistAutoMarkPaid(v);
              }}
            />
          </div>
        </Card>

          <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete recurring payment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the template and its generated instances.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={doDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    );
}
