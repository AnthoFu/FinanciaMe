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

// New Context Types
export interface WalletsContextType {
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (wallet: Wallet) => void;
  deleteWallet: (id: string) => void;
  getWalletById: (id: string) => Wallet | undefined;
}

export interface CategoriesContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

export interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

export interface SavingsGoalsContextType {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (goal: SavingsGoal) => void;
  deleteGoal: (id: string) => void;
  getGoalById: (id: string) => SavingsGoal | undefined;
  addContribution: (goalId: string, amount: number, walletId: string) => void;
}

export interface BudgetsContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
}

export interface FixedExpensesContextType {
  fixedExpenses: FixedExpense[];
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  updateFixedExpense: (expense: FixedExpense) => void;
  deleteFixedExpense: (id: string) => void;
  payFixedExpense: (id: string, walletId: string) => void;
}
