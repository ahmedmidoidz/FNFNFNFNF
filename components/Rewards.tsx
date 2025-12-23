
import React from 'react';
import { useLanguage } from './LanguageContext';
import { GiftIcon, TrendingUpIcon, ListIcon, PieChartIcon, ReceiptIcon } from './Icons';
import { Transaction, Budget, Badge } from '../types';
import InfoTag from './InfoTag';

interface RewardsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const Rewards: React.FC<RewardsProps> = ({ transactions, budgets }) => {
  const { t } = useLanguage();

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const hasReceipts = transactions.some(t => t.receiptImage);
  const overBudget = budgets.some(b => b.spent > b.limit);

  const badges: Badge[] = [
    {
        id: '1',
        key: 'rewards.badges.firstTxn',
        descriptionKey: 'rewards.badges.firstTxnDesc',
        icon: '🚀',
        unlocked: transactions.length > 0
    },
    {
        id: '2',
        key: 'rewards.badges.saver',
        descriptionKey: 'rewards.badges.saverDesc',
        icon: '💰',
        unlocked: totalIncome > totalExpense && totalIncome > 0
    },
    {
        id: '3',
        key: 'rewards.badges.budgetMaster',
        descriptionKey: 'rewards.badges.budgetMasterDesc',
        icon: '🛡️',
        unlocked: budgets.length > 0 && !overBudget && transactions.length > 0
    },
    {
        id: '4',
        key: 'rewards.badges.receiptPro',
        descriptionKey: 'rewards.badges.receiptProDesc',
        icon: '🧾',
        unlocked: hasReceipts
    }
  ];

  return (
    <div className="p-4 md:p-12 space-y-10 pb-40 max-w-7xl mx-auto animate-slide-up">
      <header>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              {t('rewards.title')}
              <InfoTag title={t('rewards.title')} description={t('help.rewards')} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm tracking-wide">{t('rewards.subtitle')}</p>
      </header>

      {/* Trophy Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, idx) => (
              <div 
                key={badge.id} 
                className={`relative p-8 rounded-[2.5rem] border-2 transition-all overflow-hidden group
                    ${badge.unlocked 
                        ? 'bg-white dark:bg-[#151515] border-amber-200 dark:border-amber-900/50 shadow-lg hover:-translate-y-2' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 grayscale opacity-70'}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                  {badge.unlocked && (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  )}
                  
                  <div className="flex flex-col items-center text-center">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-xl border-4 transition-transform group-hover:scale-110
                          ${badge.unlocked ? 'bg-amber-100 dark:bg-amber-900/30 border-white dark:border-[#151515]' : 'bg-slate-200 dark:bg-white/10 border-transparent'}`}>
                          {badge.icon}
                      </div>
                      
                      <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">{t(badge.key)}</h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed px-2">{t(badge.descriptionKey)}</p>
                      
                      <span className={`mt-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                          ${badge.unlocked ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/30' : 'bg-slate-200 dark:bg-white/10 text-slate-500 border-transparent'}`}>
                          {badge.unlocked ? t('rewards.unlocked') : t('rewards.locked')}
                      </span>
                  </div>
              </div>
          ))}
      </div>

      {/* Motivational Banner */}
      <div className="mt-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl">
              <h3 className="font-black text-3xl mb-4 tracking-tight">واصل التقدم!</h3>
              <p className="text-indigo-100 text-lg font-medium leading-relaxed">
                  كل عملية تسجيل، كل دينار توفره، يقربك أكثر من الحرية المالية. أنت في الطريق الصحيح.
              </p>
          </div>
          <GiftIcon className="absolute -bottom-10 -left-10 w-64 h-64 text-white/10 rotate-12" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Rewards;
