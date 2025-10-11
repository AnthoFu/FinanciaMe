export type Currency = 'USD' | 'VEF' | 'USDT';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: Currency;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  walletId: string;
  categoryId: string;
  goalId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currency: Currency;
  creationDate: string;
  targetDate?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  categoryId: string;
  period: 'mensual' | 'anual';
  creationDate: string;
}

export type ExpenseFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  dayOfMonth?: number;
  frequency: ExpenseFrequency;
  walletId: string | null;
  lastPaid?: string;
  startDate?: string;
  endDate?: string;
  categoryId: string;
}
