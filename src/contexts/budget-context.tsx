'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useUser } from '@/contexts/user-context';
import type {
  Transaction,
  BudgetItem,
  Category,
  RecurringTransaction,
  RecurringTemplate,
  RecurringInstance,
} from '@/lib/types';
import { categories as initialCategories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Tag } from 'lucide-react';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';
import { next90DaysWindow, generateInstancesForWindow } from '@/lib/recurring';
import { useFirestore } from '@/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  writeBatch,
  query,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface BudgetContextType {
  transactions: Transaction[];
  budgets: BudgetItem[];
  categories: Category[];

  // legacy recurring (still supported for now)
  recurringTransactions: RecurringTransaction[];

  // new recurring system
  recurringTemplates: RecurringTemplate[];
  recurringInstances: RecurringInstance[];

  addTransaction: (transaction: Omit<Transaction, 'id' | 'by'>) => void;
  updateBudgets: (newBudgets: BudgetItem[]) => void;
  deleteTransaction: (transactionId: string) => void;
  updateTransaction: (
    transactionId: string,
    transaction: Partial<Omit<Transaction, 'id' | 'by'>>
  ) => void;

  getCategoryByName: (name: string) => Category | undefined;
  addCategory: (name: string, type: 'income' | 'expense') => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  // legacy recurring (still supported for now)
  addRecurringTransaction: (
    transaction: Omit<RecurringTransaction, 'id' | 'by' | 'nextDueDate'>
  ) => void;
  updateRecurringTransaction: (
    transactionId: string,
    transaction: Partial<
      Omit<RecurringTransaction, 'id' | 'by' | 'nextDueDate'>
    >
  ) => void;
  deleteRecurringTransaction: (transactionId: string) => void;

  loading: boolean;
  savingBudgets: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const calculateNextDueDate = (
  startDateStr: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
): string => {
  const startDate = new Date(startDateStr);
  const now = new Date();
  let nextDate = new Date(startDate);

  if (nextDate > now) return nextDate.toISOString();

  const addFn =
    {
      daily: addDays,
      weekly: addWeeks,
      monthly: addMonths,
      yearly: addYears,
    }[frequency] ?? addMonths;

  while (nextDate <= now) nextDate = addFn(nextDate, 1);
  return nextDate.toISOString();
};

export const BudgetProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  // legacy recurring
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);

  // new recurring
  const [recurringTemplates, setRecurringTemplates] = useState<
    RecurringTemplate[]
  >([]);
  const [recurringInstances, setRecurringInstances] = useState<
    RecurringInstance[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [savingBudgets, setSavingBudgets] = useState(false);

  const categories = useMemo(
    () =>
      [...initialCategories, ...customCategories].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [customCategories]
  );

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setCustomCategories([]);
      setRecurringTransactions([]);
      setRecurringTemplates([]);
      setRecurringInstances([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const basePath = `users/${user.uid}`;

    const handleSnapshotError = (
      error: any,
      collectionPath: string,
      toastTitle: string
    ) => {
      if (error?.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: collectionPath,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        console.error(`Error fetching ${collectionPath}:`, error);
        toast({
          variant: 'destructive',
          title: toastTitle,
          description: error?.message ?? String(error),
        });
      }
    };

    // Ensure 90-day rolling instances exist (new recurring system)
    const ensureRecurringInstances = async (
      templates: RecurringTemplate[],
      instances: RecurringInstance[]
    ) => {
      const { from, to } = next90DaysWindow();
      const existing = new Set((instances || []).map((i) => i.id));

      for (const t of templates || []) {
        if (!t?.id) continue;
        if (t.status === 'paused') continue;

        const generated = generateInstancesForWindow(t as any, from, to);
        for (const inst of generated) {
          if (existing.has(inst.id)) continue;
          try {
            await setDoc(
              doc(db, basePath, 'recurringInstances', inst.id),
              inst,
              { merge: true }
            );
            existing.add(inst.id);
          } catch (e) {
            console.error('Error creating recurring instance', e);
          }
        }
      }
    };

    // cache so either snapshot can trigger generation safely
    const _recurringCache = {
      templates: [] as RecurringTemplate[],
      instances: [] as RecurringInstance[],
    };

    const unsubscribeTransactions = onSnapshot(
      query(collection(db, basePath, 'transactions')),
      (snapshot) => {
        const userTransactions = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Transaction)
        );
        setTransactions(userTransactions);
        setLoading(false);
      },
      (error) => {
        handleSnapshotError(
          error,
          `${basePath}/transactions`,
          'Could not load transactions.'
        );
        setLoading(false);
      }
    );

    const unsubscribeBudgets = onSnapshot(
      query(collection(db, basePath, 'budgets')),
      (snapshot) => {
        const userBudgets = snapshot.docs.map(
          (d) => ({ id: d.id, category: d.id, ...d.data() } as BudgetItem)
        );
        setBudgets(userBudgets);
      },
      (error) =>
        handleSnapshotError(error, `${basePath}/budgets`, 'Could not load budgets.')
    );

    const unsubscribeCategories = onSnapshot(
      query(collection(db, basePath, 'categories')),
      (snapshot) => {
        const userCategories = snapshot.docs.map(
          (d) =>
            ({
              id: d.id,
              ...d.data(),
              icon: Tag,
              isCustom: true,
            } as Category)
        );
        setCustomCategories(userCategories);
      },
      (error) =>
        handleSnapshotError(
          error,
          `${basePath}/categories`,
          'Could not load categories.'
        )
    );

    // legacy recurring
    const unsubscribeRecurring = onSnapshot(
      query(collection(db, basePath, 'recurringTransactions')),
      (snapshot) => {
        const userRecurring = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as RecurringTransaction)
        );
        setRecurringTransactions(userRecurring);
      },
      (error) =>
        handleSnapshotError(
          error,
          `${basePath}/recurringTransactions`,
          'Could not load recurring payments.'
        )
    );

    // new recurring templates
    const unsubscribeRecurringTemplates = onSnapshot(
      query(collection(db, basePath, 'recurringTemplates')),
      (snapshot) => {
        const templates = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as RecurringTemplate)
        );
        setRecurringTemplates(templates);
        _recurringCache.templates = templates;
        ensureRecurringInstances(_recurringCache.templates, _recurringCache.instances);
      },
      (error) =>
        handleSnapshotError(
          error,
          `${basePath}/recurringTemplates`,
          'Could not load recurring templates.'
        )
    );

    // new recurring instances
    const unsubscribeRecurringInstances = onSnapshot(
      query(collection(db, basePath, 'recurringInstances')),
      (snapshot) => {
        const instances = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as RecurringInstance)
        );
        setRecurringInstances(instances);
        _recurringCache.instances = instances;
        ensureRecurringInstances(_recurringCache.templates, _recurringCache.instances);
      },
      (error) =>
        handleSnapshotError(
          error,
          `${basePath}/recurringInstances`,
          'Could not load recurring instances.'
        )
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
      unsubscribeCategories();
      unsubscribeRecurring();
      unsubscribeRecurringTemplates();
      unsubscribeRecurringInstances();
    };
  }, [user, db, toast]);

  const getCategoryByName = useCallback(
    (name: string) => {
      if (!name) return undefined;
      return categories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() || c.id === name
      );
    },
    [categories]
  );

  const handleWriteError = useCallback(
    (
      error: any,
      context: {
        path: string;
        operation: 'create' | 'update' | 'delete';
        data?: any;
        title: string;
      }
    ) => {
      if (error?.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: context.path,
          operation: context.operation,
          requestResourceData: context.data,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        console.error(context.title, error);
        toast({
          variant: 'destructive',
          title: context.title,
          description: error?.message ?? String(error),
        });
      }
    },
    [toast]
  );

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id' | 'by'>) => {
      if (!user) return;
      const collRef = collection(db, 'users', user.uid, 'transactions');
      const docData = { ...transaction, by: user.uid };
      addDoc(collRef, docData)
        .then(() => toast({ title: 'Transaction Added' }))
        .catch((err) =>
          handleWriteError(err, {
            path: `${collRef.path}/<auto-id>`,
            operation: 'create',
            data: docData,
            title: 'Error adding transaction',
          })
        );
    },
    [user, db, toast, handleWriteError]
  );

  const deleteTransaction = useCallback(
    (transactionId: string) => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid, 'transactions', transactionId);
      deleteDoc(docRef)
        .then(() => toast({ title: 'Transaction Deleted' }))
        .catch((err) =>
          handleWriteError(err, {
            path: docRef.path,
            operation: 'delete',
            title: 'Error deleting transaction',
          })
        );
    },
    [user, db, toast, handleWriteError]
  );

  const updateTransaction = useCallback(
    (
      transactionId: string,
      transaction: Partial<Omit<Transaction, 'id' | 'by'>>
    ) => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid, 'transactions', transactionId);
      updateDoc(docRef, transaction)
        .then(() => toast({ title: 'Transaction Updated' }))
        .catch((err) =>
          handleWriteError(err, {
            path: docRef.path,
            operation: 'update',
            data: transaction,
            title: 'Error updating transaction',
          })
        );
    },
    [user, db, toast, handleWriteError]
  );

  const updateBudgets = useCallback(
    async (newBudgets: BudgetItem[]) => {
      if (!user) return;
      setSavingBudgets(true);

      const batch = writeBatch(db);
      newBudgets.forEach((budget) => {
        const docRef = doc(db, 'users', user.uid, 'budgets', budget.category);
        batch.set(docRef, { amount: budget.amount, by: user.uid });
      });

      batch
        .commit()
        .then(() => toast({ title: 'Budgets Updated' }))
        .catch((err) =>
          handleWriteError(err, {
            path: `users/${user.uid}/budgets/<batch>`,
            operation: 'update',
            data: newBudgets,
            title: 'Error updating budgets',
          })
        )
        .finally(() => setSavingBudgets(false));
    },
    [toast, user, db, handleWriteError]
  );

  const addCategory = useCallback(
    (name: string, type: 'income' | 'expense') => {
      if (!user) return;
      const collRef = collection(db, 'users', user.uid, 'categories');
      const newCategory = { name, type, by: user.uid };

      addDoc(collRef, newCategory)
        .then(() => toast({ title: 'Category Added' }))
        .catch((err) =>
          handleWriteError(err, {
            path: `${collRef.path}/<auto-id>`,
            operation: 'create',
            data: newCategory,
            title: 'Error adding category',
          })
        );
    },
    [toast, user, db, handleWriteError]
  );

  const updateCategory = useCallback(
    (id: string, name: string) => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid, 'categories', id);
      updateDoc(docRef, { name })
        .then(() => toast({ title: 'Category Updated' }))
        .catch((err) =>
          handleWriteError(err, {
            path: docRef.path,
            operation: 'update',
            data: { name },
            title: 'Error updating category',
          })
        );
    },
    [toast, user, db, handleWriteError]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      if (!user) return;
      const isCategoryInUse = transactions.some((t) => t.category === id);
      if (isCategoryInUse) {
        toast({
          variant: 'destructive',
          title: 'Cannot delete category',
          description: 'This category is being used by one or more transactions.',
        });
        return;
      }

      const docRef = doc(db, 'users', user.uid, 'categories', id);
      deleteDoc(docRef)
        .then(() => toast({ title: 'Category Deleted' }))
        .catch((err) =>
          handleWriteError(err, {
            path: docRef.path,
            operation: 'delete',
            title: 'Error deleting category',
          })
        );
    },
    [toast, user, db, transactions, handleWriteError]
  );

  // legacy recurring (still works; we’ll migrate later)
  const addRecurringTransaction = useCallback(
    (transaction: Omit<RecurringTransaction, 'id' | 'by' | 'nextDueDate'>) => {
      if (!user) return;

      const collRef = collection(db, 'users', user.uid, 'recurringTransactions');
      const newRecurring = {
        ...transaction,
        by: user.uid,
        nextDueDate: calculateNextDueDate(
          transaction.startDate,
          transaction.frequency
        ),
      };

      addDoc(collRef, newRecurring)
        .then(() => toast({ title: 'Recurring Payment Added' }))
        .catch((err) =>
          handleWriteError(err, {
            path: `${collRef.path}/<auto-id>`,
            operation: 'create',
            data: newRecurring,
            title: 'Error adding recurring payment',
          })
        );
    },
    [user, db, toast, handleWriteError]
  );

  const updateRecurringTransaction = useCallback(
    (
      transactionId: string,
      transaction: Partial<Omit<RecurringTransaction, 'id' | 'by' | 'nextDueDate'>>
    ) => {
      if (!user) return;

      const existing = recurringTransactions.find((t) => t.id === transactionId);

      // Keep nextDueDate sane if they edit startDate/frequency
      const startDate =
        (transaction as any).startDate ?? (existing as any)?.startDate;
      const frequency =
        (transaction as any).frequency ?? (existing as any)?.frequency;

      const updatedData: any = { ...transaction };

      if (startDate && frequency) {
        updatedData.nextDueDate = calculateNextDueDate(startDate, frequency);
      }

      const docRef = doc(db, 'users', user.uid, 'recurringTransactions', transactionId);

      updateDoc(docRef, updatedData)
        .then(() => toast({ title: 'Recurring Payment Updated' }))
        .catch((err) =>
          handleWriteError(err, {
            path: docRef.path,
            operation: 'update',
            data: updatedData,
            title: 'Error updating recurring payment',
          })
        );
    },
    [user, db, toast, handleWriteError, recurringTransactions]
  );

  const deleteRecurringTransaction = useCallback(
    (transactionId: string) => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid, 'recurringTransactions', transactionId);

      deleteDoc(docRef)
        .then(() => toast({ title: 'Recurring Payment Deleted' }))
        .catch((err) =>
          handleWriteError(err, {
            path: docRef.path,
            operation: 'delete',
            title: 'Error deleting recurring payment',
          })
        );
    },
    [user, db, toast, handleWriteError]
  );

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      categories,

      recurringTransactions,
      recurringTemplates,
      recurringInstances,

      addTransaction,
      updateBudgets,
      deleteTransaction,
      updateTransaction,

      getCategoryByName,
      addCategory,
      updateCategory,
      deleteCategory,

      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,

      loading,
      savingBudgets,
    }),
    [
      transactions,
      budgets,
      categories,
      recurringTransactions,
      recurringTemplates,
      recurringInstances,
      addTransaction,
      updateBudgets,
      deleteTransaction,
      updateTransaction,
      getCategoryByName,
      addCategory,
      updateCategory,
      deleteCategory,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      loading,
      savingBudgets,
    ]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
