
import React, { useState, useMemo } from 'react';
import { Transaction, Subscription, Account } from '../types';
import { useLanguage } from './LanguageContext';
import { MenuIcon, ListIcon, ClockIcon, SparklesIcon, WalletIcon, CalendarIcon } from './Icons';
import { getCategoryDef } from '../data/categories';

interface TransactionsViewProps {
  transactions: Transaction[];
  customCategories: string[];
  accounts: Account[];
  formatCurrency: (amount: number) => string;
  onEdit: (txn: Transaction) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  subscriptions?: Subscription[]; 
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ 
    transactions, 
    customCategories, 
    accounts,
    formatCurrency, 
    onEdit, 
    onDelete,
    onExport,
    subscriptions = []
}) => {
    const { t, language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [accountFilter, setAccountFilter] = useState('All');
    const [timeFilter, setTimeFilter] = useState('All');

    const allTransactions = useMemo(() => {
        const ghosts: Transaction[] = subscriptions.map(sub => ({
            id: `ghost-${sub.id}`,
            amount: sub.amount,
            category: sub.category || 'Utilities',
            merchant: sub.name,
            date: sub.nextBillingDate,
            type: 'expense',
            currency: 'DZD',
            status: 'pending',
            isGhost: true,
            note: 'Upcoming Outflow'
        }));
        return [...transactions, ...ghosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, subscriptions]);

    const filtered = allTransactions.filter(t => {
        const matchSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = categoryFilter === 'All' ? true : t.category === categoryFilter;
        const matchAccount = accountFilter === 'All' ? true : t.accountId === accountFilter;
        
        let matchTime = true;
        const txnDate = new Date(t.date);
        const now = new Date();
        if (timeFilter === 'This Month') {
            matchTime = txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
        } else if (timeFilter === 'Last Month') {
            const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const targetYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            matchTime = txnDate.getMonth() === lastMonth && txnDate.getFullYear() === targetYear;
        }

        return matchSearch && matchCat && matchAccount && matchTime;
    });

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};
        filtered.forEach(txn => {
            const date = txn.date;
            if (!groups[date]) groups[date] = [];
            groups[date].push(txn);
        });
        return groups;
    }, [filtered]);

    return (
        <div className="p-4 md:p-12 pb-32 md:pb-40 max-w-[1200px] mx-auto animate-slide">
            <header className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                        {t('transactions.title')}
                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/5">
                            <ListIcon className="w-6 h-6 text-brand-mint" />
                        </div>
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-widest">{t('transactions.subtitle')}</p>
                </div>
                <button onClick={onExport} className="px-8 py-4 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl text-xs font-black shadow-soft hover:shadow-md transition active:scale-95 uppercase tracking-widest">
                    Export CSV
                </button>
            </header>
            
            {/* Filters Bar */}
            <div className="sticky top-2 z-30 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-xl p-2 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg mb-8 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2">
                    <input 
                        type="text" placeholder={t('transactions.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-brand-mint rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all placeholder:text-slate-400 text-sm"
                    />
                </div>
                
                <div className="relative">
                    <select 
                        value={accountFilter}
                        onChange={(e) => setAccountFilter(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-brand-mint rounded-2xl appearance-none font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer transition-colors text-sm"
                    >
                        <option value="All">All Accounts</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                    <WalletIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-brand-mint rounded-2xl appearance-none font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer transition-colors text-sm"
                    >
                        <option value="All">All Time</option>
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                    </select>
                    <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-8">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <SparklesIcon className="w-16 h-16 text-slate-300 mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em]">No transactions found</p>
                    </div>
                ) : (
                    Object.entries(groupedTransactions).map(([date, txns]: [string, Transaction[]]) => (
                        <div key={date} className="space-y-4">
                            <div className="flex items-center gap-4 px-2">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 dark:bg-[#151515] px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">{date}</span>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
                            </div>
                            
                            <div className="grid gap-3">
                                {txns.map(txn => {
                                    const cat = getCategoryDef(txn.category, customCategories);
                                    return (
                                        <div key={txn.id} className={`group relative bg-white dark:bg-[#151515] rounded-3xl p-5 border border-slate-200 dark:border-white/5 hover:border-brand-mint dark:hover:border-brand-mint shadow-sm hover:shadow-md transition-all cursor-pointer ${txn.isGhost ? 'opacity-50 grayscale border-dashed' : ''}`}>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-5 overflow-hidden">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-black/5 shrink-0 ${cat.color.replace('text-', 'bg-').replace('100', '100').replace('600', '500/20')} text-black dark:text-white`}>
                                                        {cat.icon}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate">{txn.merchant}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t(`categories.${txn.category}`) || txn.category}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right shrink-0">
                                                    <span className={`block text-lg md:text-xl font-black dir-ltr ${txn.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                                    </span>
                                                    {txn.isGhost && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">PENDING</span>}
                                                </div>
                                            </div>
                                            
                                            {/* Hover Actions */}
                                            {!txn.isGhost && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white dark:bg-[#151515] p-1 rounded-xl shadow-lg border border-slate-100 dark:border-white/10">
                                                    <button onClick={(e) => {e.stopPropagation(); onDelete(txn.id);}} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
                                                        <ListIcon className="w-4 h-4" /> {/* Should be Trash, reusing List for now as per imports */}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionsView;
