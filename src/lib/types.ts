export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'e-transfer-send' | 'e-transfer-receive';
  amount: number;
  category?: string;
  contact?: string;
  date: string;
  description: string;
  by: string; // This is the UID of the user who created the transaction
};

export type Category = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  isCustom?: boolean;
  type?: 'income' | 'expense';
};

export type BudgetItem = {
  id?: string; // The Firestore document ID
  category: string;
  amount: number;
  by?: string;
};

export type UserProfile = {
  displayName: string;
  email: string;
};

export type RecurringTransaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDueDate: string;
  by: string;
};


// =========================
// Recurring Payments (3-layer system)
// =========================

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';
export type RecurringTemplateStatus = 'active' | 'paused';
export type RecurringInstanceStatus = 'scheduled' | 'due' | 'paid' | 'skipped' | 'overdue';

export type RecurringTemplate = {
  id: string;

  name: string;
  amount: number;
  category: string; // category id or name (we store what the app already uses)
  frequency: RecurringFrequency;

  startDate: string; // ISO date string (YYYY-MM-DD recommended)
  endDate?: string;  // optional ISO date string

  autopost: boolean; // default false
  status: RecurringTemplateStatus; // active/paused
  createdAt?: any;
  updatedAt?: any;
};

export type RecurringInstance = {
  id: string; // deterministic: templateId_YYYYMMDD

  templateId: string;
  dueDate: string; // ISO date string
  amountSnapshot: number;
  categorySnapshot: string;

  status: RecurringInstanceStatus;
  linkedTransactionId?: string;

  createdAt?: any;
  updatedAt?: any;
};

