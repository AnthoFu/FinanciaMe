
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: 'USD' | 'BS';
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  walletId: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: 'USD' | 'BS';
  dayOfMonth: number;
  walletId: string | null;
  lastPaid?: string;
  startDate?: string;
  endDate?: string;
}
