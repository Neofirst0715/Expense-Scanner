export type Category = 'Food & Drink' | 'Transport' | 'Housing' | 'Electronics' | 'Travel' | 'Healthcare' | 'Education' | 'Fitness' | 'Other';

export interface Expense {
  id: string;
  merchant: string;
  category: Category;
  date: string;
  amount: number;
  icon: string;
  color: string;
  isRecurring?: boolean;
  items?: { name: string; quantity: number; price: number }[];

}

export type View = 'home' | 'history' | 'settings' | 'review' | 'scanning' | 'manual-add' | 'notifications' | 'edit-expense';
