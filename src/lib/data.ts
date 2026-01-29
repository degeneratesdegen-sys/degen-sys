import type { Category } from '@/lib/types';
import { ShoppingCart, Home, Utensils, Car, Shirt, Activity, Landmark, Briefcase, Zap, CreditCard, Gift, GraduationCap, Plane, Film } from 'lucide-react';

export const categories: Category[] = [
  { id: 'groceries', name: 'Groceries', icon: ShoppingCart, type: 'expense' },
  { id: 'rent', name: 'Rent', icon: Home, type: 'expense' },
  { id: 'restaurants', name: 'Restaurants', icon: Utensils, type: 'expense' },
  { id: 'transport', name: 'Transport', icon: Car, type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: Shirt, type: 'expense' },
  { id: 'health', name: 'Health', icon: Activity, type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: Landmark, type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, type: 'expense' },
  { id: 'gifts', name: 'Gifts', icon: Gift, type: 'expense' },
  { id: 'education', name: 'Education', icon: GraduationCap, type: 'expense' },
  { id: 'travel', name: 'Travel', icon: Plane, type: 'expense' },
  { id: 'salary', name: 'Salary', icon: Briefcase, type: 'income' },
  { id: 'shakepay-purchase', name: 'Shakepay Purchase', icon: CreditCard, type: 'expense' },
  { id: 'shakepay-cashback', name: 'Shakepay Cashback', icon: Zap, type: 'income' },
];
