
import React, { useState } from 'react';
import { Debt, Account } from '../types';
import { HandCoinsIcon, PlusIcon, XIcon, CheckCircleIcon, WalletIcon, ClockIcon, MessageCircleIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import { useLanguage } from './LanguageContext';

interface DebtsProps {
    debts: Debt[];
    accounts: Account[];
    onAddDebt: (debt: Omit<Debt, 'id'>) => void;
    onSettleDebt: (debtId: string, accountId: string, amount?: number) => void;
    formatCurrency: (amount: number) => string;
}

const Debts: React.FC<DebtsProps> = ({ debts, accounts, onAddDebt, onSettleDebt, formatCurrency }) => {
    const { t } = useLanguage();
    const [view, setView] = useState<'lent' | 'borrowed'>('lent');
    const [showModal, setShowModal] = useState(false);
    const [settlingId, setSettlingId] = useState<string | null>(null);
    const [settleAmount, setSettleAmount] = useState('');
    const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');
    
    const [person, setPerson] = useState('');
    const [amount, setAmount] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAddDebt({ 
            person, 
            amount: parseFloat(amount), 
            remainingAmount: parseFloat(amount),
            type: view, 
            isPaid: false,
            history: []
        });
        setShowModal(false);
        setPerson(''); setAmount('');
    };

    const handleSettle = () => {
        if (!settlingId) return;
        const amountToPay = settleAmount ? parseFloat(settleAmount) : undefined;
        onSettleDebt(settlingId, targetAccountId, amountToPay);
        setSettlingId(null);
        setSettleAmount('');
    };

    const generateWhatsAppLink = (debt: Debt) => {
        const message = `السلام عليكم ${debt.person}. حبيت نذكرك برك بالدين لي بيناتنا (${formatCurrency(debt.remainingAmount)}). ربي يحفظك ويرزقك.`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };

    const totalLent = debts.filter(d => d.type === 'lent').reduce((s, d) => s + d.remainingAmount, 0);
    const totalBorrowed = debts.filter(d => d.type === 'borrowed').reduce((s, d) => s + d.remainingAmount, 0);

    return (
        <div className="p-4 md:p-12 space-y-10 pb-40 max-w-7xl mx-auto animate-slide-up">
             <header className="flex flex-col sm:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                        {t('debts.title')}
                        <span className={`px-3 py-1 rounded-xl text-sm font-black border ${view === 'lent' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200' : 'bg-red-100 dark:bg-red-900/20 text-red-600 border-red-200'}`}>
                            {formatCurrency(view === 'lent' ? totalLent : totalBorrowed)}
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm tracking-wide">{t('debts.subtitle')}</p>
                </div>
                
                {/* Custom Toggle Switch */}
                <div className="bg-slate-100 dark:bg-[#151515] p-1.5 rounded-2xl flex border border-slate-200 dark:border-white/5 shadow-inner w-full sm:w-auto">
                    <button 
                        onClick={() => setView('lent')} 
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${view === 'lent' ? 'bg-white dark:bg-brand-mint text-slate-900 shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                        <ArrowUpIcon className={`w-4 h-4 ${view === 'lent' ? 'text-emerald-500 dark:text-black' : ''}`} />
                        دراهم لي
                    </button>
                    <button 
                        onClick={() => setView('borrowed')} 
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${view === 'borrowed' ? 'bg-white dark:bg-brand-heat text-slate-900 dark:text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                        <ArrowDownIcon className={`w-4 h-4 ${view === 'borrowed' ? 'text-red-500 dark:text-white' : ''}`} />
                        كريدي عليا
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debts.filter(d => d.type === view).map(debt => {
                    const percentPaid = Math.min(((debt.amount - debt.remainingAmount) / debt.amount) * 100, 100);
                    
                    return (
                        <div key={debt.id} className={`group relative bg-white dark:bg-[#151515] p-8 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between min-h-[280px] shadow-sm hover:shadow-lg
                            ${debt.isPaid 
                                ? 'border-slate-100 dark:border-white/5 opacity-60 hover:opacity-100' 
                                : view === 'lent' ? 'border-emerald-100 dark:border-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-500/50' : 'border-red-100 dark:border-red-900/20 hover:border-red-300 dark:hover:border-red-500/50'}`}>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border border-white/10
                                            ${debt.isPaid ? 'bg-slate-200 text-slate-500' : view === 'lent' ? 'bg-emerald-500 text-white' : 'bg-brand-heat text-white'}`}>
                                            {debt.person[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className={`font-black text-lg ${debt.isPaid ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{debt.person}</h3>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${debt.isPaid ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 dark:bg-white/10 text-slate-500'}`}>
                                                {debt.isPaid ? 'تم السداد' : 'جاري'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">الأصل</span>
                                        <span className="font-bold text-slate-900 dark:text-white opacity-50 text-sm line-through decoration-slate-400/50">{formatCurrency(debt.amount)}</span>
                                    </div>
                                </div>
                                
                                {/* Repayment History / Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>المدفوع</span>
                                        <span>{percentPaid.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                                        <div 
                                            className={`h-full transition-all duration-1000 rounded-full ${view === 'lent' ? 'bg-emerald-500' : 'bg-brand-heat'}`} 
                                            style={{ width: `${percentPaid}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
                                 <div>
                                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">الباقي</p>
                                     <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(debt.remainingAmount)}</p>
                                 </div>
                                 {!debt.isPaid && (
                                     <div className="flex gap-2">
                                         {/* WhatsApp Reminder Button */}
                                         {view === 'lent' && (
                                             <a 
                                                href={generateWhatsAppLink(debt)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
                                                title="أرسل تذكير في واتساب"
                                             >
                                                 <MessageCircleIcon className="w-5 h-5" />
                                             </a>
                                         )}
                                         <button 
                                            onClick={() => setSettlingId(debt.id)}
                                            className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 transition-all shadow-md"
                                            title="تسجيل دفعة"
                                         >
                                            <CheckCircleIcon className="w-5 h-5" />
                                         </button>
                                     </div>
                                 )}
                            </div>
                        </div>
                    );
                })}
                
                <button 
                    onClick={() => setShowModal(true)} 
                    className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:text-brand-mint hover:border-brand-mint dark:hover:border-brand-mint transition-all min-h-[280px] group bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                >
                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-mint/20 transition-colors shadow-sm">
                        <PlusIcon className="w-6 h-6 group-hover:text-brand-mint transition-colors" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-[0.2em]">تسجيل دين جديد</span>
                </button>
            </div>

            {/* Settle/Partial Repayment Modal */}
            {settlingId && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all" onClick={() => setSettlingId(null)}></div>
                    <div className="bg-white dark:bg-[#12141C] w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 relative z-10">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">تسديد دفعة</h2>
                            <button onClick={() => setSettlingId(null)} className="p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition"><XIcon className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">المبلغ المدفوع (اتركه فارغاً للتسديد الكلي)</label>
                                <input 
                                    type="number"
                                    value={settleAmount}
                                    onChange={(e) => setSettleAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">اختر الحساب</label>
                                <select 
                                    value={targetAccountId} 
                                    onChange={e => setTargetAccountId(e.target.value)}
                                    className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer focus:border-brand-mint transition-colors"
                                >
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={handleSettle}
                                className="w-full py-5 bg-brand-mint text-black rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-transform text-lg mt-4"
                            >
                                تأكيد العملية
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white dark:bg-[#12141C] w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-white/20 animate-in zoom-in-95 relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">إضافة دين جديد</h2>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-full text-slate-400 hover:text-brand-heat transition-all"><XIcon className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">مع من؟</label>
                                <input type="text" required value={person} onChange={e => setPerson(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors" placeholder="الاسم..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">المبلغ</label>
                                <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors" placeholder="0" />
                            </div>
                            <button type="submit" className="w-full py-6 bg-slate-900 dark:bg-brand-mint text-white dark:text-black rounded-[2rem] font-black text-xl shadow-xl hover:scale-[1.02] transition-transform mt-4">حفظ السجل</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Debts;
