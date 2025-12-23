
import { CategoryDef } from '../types';

export const DEFAULT_CATEGORIES: Record<string, CategoryDef> = {
  Food: { id: 'Food', name: 'categories.Food', icon: '🍔', color: 'bg-orange-100 text-orange-600', type: 'expense' },
  Transport: { id: 'Transport', name: 'categories.Transport', icon: '🚕', color: 'bg-blue-100 text-blue-600', type: 'expense' },
  Shopping: { id: 'Shopping', name: 'categories.Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-600', type: 'expense' },
  Utilities: { id: 'Utilities', name: 'categories.Utilities', icon: '💡', color: 'bg-yellow-100 text-yellow-600', type: 'expense' },
  Entertainment: { id: 'Entertainment', name: 'categories.Entertainment', icon: '🎬', color: 'bg-purple-100 text-purple-600', type: 'expense' },
  Health: { id: 'Health', name: 'categories.Health', icon: '💊', color: 'bg-red-100 text-red-600', type: 'expense' },
  General: { id: 'General', name: 'categories.General', icon: '📝', color: 'bg-slate-100 text-slate-600', type: 'both' },
  Salary: { id: 'Salary', name: 'categories.Salary', icon: '💰', color: 'bg-emerald-100 text-emerald-600', type: 'income' },
  Freelance: { id: 'Freelance', name: 'categories.Freelance', icon: '💻', color: 'bg-indigo-100 text-indigo-600', type: 'income' },
  Gift: { id: 'Gift', name: 'categories.Gift', icon: '🎁', color: 'bg-rose-100 text-rose-600', type: 'both' },
  Investment: { id: 'Investment', name: 'categories.Investment', icon: '📈', color: 'bg-cyan-100 text-cyan-600', type: 'income' },
  Refund: { id: 'Refund', name: 'categories.Refund', icon: '↩️', color: 'bg-teal-100 text-teal-600', type: 'income' },
  Transfer: { id: 'Transfer', name: 'categories.Transfer', icon: '⇄', color: 'bg-slate-100 text-slate-600', type: 'both' },
};

export const getCategoryDef = (key: string, customCategories: string[] = []): CategoryDef => {
    if (DEFAULT_CATEGORIES[key]) {
        return DEFAULT_CATEGORIES[key];
    }
    // Fallback for custom categories
    return {
        id: key,
        name: key, // No translation key, use raw string
        icon: '🏷️',
        color: 'bg-slate-100 text-slate-600',
        type: 'expense'
    };
};
