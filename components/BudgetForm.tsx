
import React, { useState } from 'react';
import { Budget, Transaction } from '../types';
import { XIcon, CheckCircleIcon, PieChartIcon, SparklesIcon } from './Icons';
import { useLanguage } from './LanguageContext';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { suggestCategoryBudget } from '../services/geminiService';

interface BudgetFormProps {
  onAdd: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  onClose: () => void;
  transactions: Transaction[]; // Added to analyze history
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onAdd, onClose, transactions }) => {
  const { t } = useLanguage();
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit) return;
    onAdd({
      category,
      limit: parseFloat(limit),
      color: 'bg-primary-500'
    });
    onClose();
  };

  const handleAiSuggest = async () => {
      setIsAiLoading(true);
      setAiSuggestion(null);
      const result = await suggestCategoryBudget(category, transactions);
      if (result && result.suggestedLimit) {
          setLimit(result.suggestedLimit.toString());
          setAiSuggestion(result.reason);
      }
      setIsAiLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5 animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-6 flex justify-between items-center shrink-0 border-b border-slate-50 dark:border-white/5">
            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
                <PieChartIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{t('budgets.newBudget')}</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <XIcon className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block px-1">{t('common.category')}</label>
            <div className="relative">
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                >
                    {Object.keys(DEFAULT_CATEGORIES).map(cat => (
                        <option key={cat} value={cat} className="bg-white dark:bg-[#0f172a]">{DEFAULT_CATEGORIES[cat].icon} {t(`categories.${cat}`)}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="space-y-2 pb-4">
             <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block text-center">{t('budgets.limit')}</label>
             <div className="flex items-center justify-center gap-3">
                 <input
                    type="number"
                    required
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                    className="bg-transparent border-none outline-none text-5xl font-black text-slate-800 dark:text-white w-full text-center placeholder:text-slate-200 dark:placeholder:text-slate-800"
                    placeholder="0"
                    autoFocus
                />
             </div>
             
             {/* AI Suggest Button */}
             <div className="flex justify-center mt-2">
                 <button 
                    type="button" 
                    onClick={handleAiSuggest}
                    disabled={isAiLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                 >
                     {isAiLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-3 h-3" />}
                     {isAiLoading ? 'جاري الحساب...' : 'اقتراح ذكي (AI)'}
                 </button>
             </div>
             {aiSuggestion && (
                 <p className="text-center text-xs font-bold text-violet-600 dark:text-violet-400 mt-3 animate-in fade-in bg-violet-50 dark:bg-violet-900/10 p-3 rounded-xl">
                     💡 {aiSuggestion}
                 </p>
             )}
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[2rem] font-black text-lg shadow-lg shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <CheckCircleIcon className="w-6 h-6" />
            {t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
