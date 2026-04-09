import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (expenseData: Partial<Expense>) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (!res.ok) throw new Error('Failed to add expense');
      const newExpense = await res.json();
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (!res.ok) throw new Error('Failed to update expense');
      const updated = await res.json();
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: fetchExpenses,
  };
}
