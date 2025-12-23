
import React, { useState } from 'react';
import { Budget, SavingsGoal, Transaction } from '../types';
import { PlusIcon, XIcon, CheckCircleIcon, TrendingUpIcon } from './Icons';
import { useLanguage } from './LanguageContext';
import InfoTag from './InfoTag';
import BudgetForm from './BudgetForm';

interface BudgetsProps {
  budgets: Budget[];
  onAddClick?: () => void; 
  onAddBudget?: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'saved'>) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  formatCurrency: (amount: number) => string;
}

const Budgets: React.FC<BudgetsProps> = ({ budgets, onAddClick, onAddBudget, transactions, savingsGoals, onAddGoal, onUpdateGoal, formatCurrency }) => {
  const { t } = useLanguage();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const handleCreateGoal = (e: React.FormEvent) => {
      e.preventDefault();
      onAddGoal({
          name: goalName,
          target: parseFloat(targetAmount),
          emoji: '🎯',
          color: 'bg-slate-900'
      });
      setShowGoalModal(false);
      setGoalName('');
      setTargetAmount('');
  };

  const handleAddBudgetTrigger = () => {
      if (onAddClick) {
          onAddClick();
      } else {
          setShowAddBudgetModal(true);
      }
  };

  return (
    <div className="p-4 md:p-10 space-y-12 pb-32 max-w-7xl mx-auto animate-slide-up">
      
      {/* 1. BUDGETS SECTION */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-8">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                    {t('budgets.title')}
                    <InfoTag title={t('budgets.title')} description={t('help.budgets')} />
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm tracking-wide">{t('budgets.subtitle')}</p>
            </div>
            <button 
                onClick={handleAddBudgetTrigger}
                className="group flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl hover:scale-[1.02] transition-all shadow-soft border border-slate-700 dark:border-slate-200"
            >
                <div className="bg-white/20 dark:bg-black/10 p-1 rounded-lg">
                    <PlusIcon className="w-4 h-4" />
                </div>
                <span className="font-black text-xs uppercase tracking-widest">{t('budgets.create')}</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget, index) => {
                const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                const isOverLimit = budget.spent > budget.limit;
                
                // Refined Colors with Border Logic
                let bgClass = "bg-white dark:bg-[#151515]";
                let borderClass = "border-slate-200 dark:border-white/5";
                let barColor = "bg-slate-900 dark:bg-white";
                let iconColor = "text-slate-900 dark:text-white";
                
                if (isOverLimit) {
                    bgClass = "bg-red-50 dark:bg-red-900/10";
                    borderClass = "border-red-200 dark:border-red-900/30";
                    barColor = "bg-red-500";
                    iconColor = "text-red-600 dark:text-red-400";
                } else if (percentage > 85) {
                    bgClass = "bg-amber-50 dark:bg-amber-900/10";
                    borderClass = "border-amber-200 dark:border-amber-900/30";
                    barColor = "bg-amber-500";
                    iconColor = "text-amber-600 dark:text-amber-400";
                } else {
                    // Safe zone - Brand style
                    borderClass = "border-slate-200 dark:border-white/10 hover:border-brand-mint/50 transition-colors";
                }
            
                return (
                    <div 
                        key={budget.id} 
                        onClick={() => setSelectedBudget(budget)}
                        className={`relative overflow-hidden rounded-[2.2rem] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group border-2 ${bgClass} ${borderClass}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border border-black/5 bg-white dark:bg-white/5 shadow-sm ${iconColor}`}>
                                    {budget.category[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">{t(`categories.${budget.category}`) || budget.category}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{percentage.toFixed(0)}% Used</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-black dir-ltr text-slate-900 dark:text-white">{formatCurrency(budget.limit)}</span>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-3 overflow-hidden border border-black/5 dark:border-white/5">
                                <div 
                                    className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out relative ${barColor}`}
                                    style={{ width: `${percentage}%` }}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                                <span>صرفت: <span className={isOverLimit ? 'text-red-500' : ''}>{formatCurrency(budget.spent)}</span></span>
                                <span>باقي: {formatCurrency(Math.max(0, budget.limit - budget.spent))}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            <div 
                onClick={handleAddBudgetTrigger}
                className="rounded-[2.2rem] border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 hover:border-brand-mint/50 transition-all min-h-[180px] group"
            >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 transition-colors group-hover:bg-white group-hover:shadow-md">
                    <PlusIcon className="w-6 h-6 text-slate-400 group-hover:text-brand-mint" />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 group-hover:text-brand-mint">New Budget</span>
            </div>
        </div>
      </section>
      
      {/* 2. SAVINGS GOALS */}
      <section>
          <div className="flex justify-between items-center mb-8 border-t border-slate-100 dark:border-white/5 pt-10">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <TrendingUpIcon className="w-6 h-6 text-brand-mint" />
                    {t('budgets.savingsGoals')}
                </h2>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">حصالات التوفير</p>
            </div>
            <button 
                onClick={() => setShowGoalModal(true)}
                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-mint border border-slate-200 dark:border-white/10 px-5 py-2.5 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm"
            >
                + {t('budgets.addGoal')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savingsGoals.map(goal => {
                  const percent = Math.min((goal.saved / goal.target) * 100, 100);
                  return (
                    <div key={goal.id} className="group bg-white dark:bg-[#151515] rounded-[2.5rem] p-1.5 border border-slate-200 dark:border-white/5 shadow-soft hover:shadow-lg transition-all relative overflow-hidden">
                        <div className="bg-slate-50 dark:bg-[#1A1A1A] rounded-[2.2rem] p-6 h-full flex flex-col justify-between relative overflow-hidden">
                            
                            {/* Decorative background blur */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-mint/5 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                    {goal.emoji}
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1">الهدف</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white dir-ltr">{formatCurrency(goal.target)}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">{goal.name}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs font-bold text-brand-mint">{formatCurrency(goal.saved)}</span>
                                        <span className="text-[10px] font-black text-slate-400">{percent.toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-slate-900 dark:bg-brand-mint h-full rounded-full transition-all duration-1000 relative" style={{width: `${percent}%`}}></div>
                                </div>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const amount = prompt("Add amount to savings:");
                                        if (amount && !isNaN(parseFloat(amount))) {
                                            onUpdateGoal(goal.id, parseFloat(amount));
                                        }
                                    }}
                                    className="w-full py-3.5 rounded-xl bg-white dark:bg-white/5 hover:bg-brand-mint hover:text-black text-slate-500 font-black text-xs uppercase tracking-widest transition-colors border border-slate-200 dark:border-white/5 shadow-sm"
                                >
                                    + {t('budgets.addToGoal')}
                                </button>
                            </div>
                        </div>
                    </div>
                  );
              })}
          </div>
      </section>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowGoalModal(false)}></div>
            <div className="relative bg-white dark:bg-[#12141C] w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{t('budgets.newGoal')}</h2>
                    <button onClick={() => setShowGoalModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"><XIcon className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">اسم الهدف</label>
                        <input 
                            type="text" 
                            required 
                            value={goalName} 
                            onChange={e => setGoalName(e.target.value)} 
                            className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors"
                            placeholder="مثلاً: سيارة، عمرة..."
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">المبلغ المطلوب</label>
                        <input 
                            type="number" 
                            required 
                            value={targetAmount} 
                            onChange={e => setTargetAmount(e.target.value)} 
                            className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors"
                            placeholder="0"
                        />
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-brand-mint text-white dark:text-black rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-transform mt-2">حفظ الهدف</button>
                </form>
            </div>
        </div>
      )}

      {/* Budget Modal */}
      {showAddBudgetModal && onAddBudget && (
          <BudgetForm 
            onAdd={onAddBudget} 
            onClose={() => setShowAddBudgetModal(false)} 
            transactions={transactions}
          />
      )}

    </div>
  );
};

export default Budgets;
