
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: 'USD' | 'VEF' | 'USDT';
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  walletId: string;
  category?: string; // New optional category field
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: 'USD' | 'VEF' | 'USDT';
  dayOfMonth: number;
  walletId: string | null;
  lastPaid?: string;
  startDate?: string;
  endDate?: string;
}
