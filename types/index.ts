
export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: 'USD' | 'VEF' | 'USDT';
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Nombre del icono de SF Symbols o similar
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  walletId: string;
  categoryId: string; // Cambiamos de 'category' a 'categoryId'
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
  categoryId: string; // Añadimos categoryId para consistencia
}
