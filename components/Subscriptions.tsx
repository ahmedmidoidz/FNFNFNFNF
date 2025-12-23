
import React, { useState } from 'react';
import { Subscription } from '../types';
import { useLanguage } from './LanguageContext';
import { PlusIcon, TrashIcon, CalendarIcon, ChipIcon, XIcon, CheckCircleIcon } from './Icons';
import InfoTag from './InfoTag';

interface SubscriptionsProps {
    subscriptions: Subscription[];
    onAdd: (sub: Omit<Subscription, 'id'>) => void;
    onDelete: (id: string) => void;
    formatCurrency: (amount: number) => string;
}

const BRAND_COLORS = [
    { id: 'netflix', bg: 'bg-red-600', text: 'text-red-600' },
    { id: 'spotify', bg: 'bg-green-500', text: 'text-green-500' },
    { id: 'prime', bg: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'disney', bg: 'bg-indigo-600', text: 'text-indigo-600' },
    { id: 'apple', bg: 'bg-slate-800', text: 'text-slate-800' },
    { id: 'gym', bg: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'internet', bg: 'bg-cyan-500', text: 'text-cyan-500' },
    { id: 'other', bg: 'bg-slate-500', text: 'text-slate-500' },
];

const Subscriptions: React.FC<SubscriptionsProps> = ({ subscriptions, onAdd, onDelete, formatCurrency }) => {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedColor, setSelectedColor] = useState(BRAND_COLORS[0]);

    const monthlyTotal = subscriptions.reduce((sum, sub) => {
        return sum + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
    }, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name,
            amount: parseFloat(amount),
            billingCycle: cycle,
            nextBillingDate: date,
            icon: name[0].toUpperCase(),
            color: selectedColor.bg,
            category: 'Utilities',
            autoDeduct: true
        });
        setShowModal(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setAmount('');
        setDate('');
        setCycle('monthly');
        setSelectedColor(BRAND_COLORS[0]);
    };

    const getBillingStatus = (dateStr: string, cycle: 'monthly' | 'yearly') => {
        const today = new Date();
        const due = new Date(dateStr);
        
        // Calculate days difference
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // Calculate progress percentage based on cycle
        const totalDays = cycle === 'monthly' ? 30 : 365;
        // If due date is passed, treat as 100% or overdue
        const daysPassed = totalDays - diffDays;
        const progress = Math.max(0, Math.min(100, (daysPassed / totalDays) * 100));

        let statusText = `${diffDays} ${t('subscriptions.days')}`;
        let statusColor = 'bg-emerald-500';
        let textColor = 'text-emerald-600';
        let bgLight = 'bg-emerald-100 dark:bg-emerald-900/20';

        if (diffDays < 0) {
            statusText = t('subscriptions.due');
            statusColor = 'bg-red-500';
            textColor = 'text-red-600';
            bgLight = 'bg-red-100 dark:bg-red-900/20';
        } else if (diffDays <= 3) {
            statusColor = 'bg-amber-500';
            textColor = 'text-amber-600';
            bgLight = 'bg-amber-100 dark:bg-amber-900/20';
        } else if (diffDays <= 7) {
            statusColor = 'bg-blue-500';
            textColor = 'text-blue-600';
            bgLight = 'bg-blue-100 dark:bg-blue-900/20';
        }

        return { text: statusText, progress, color: statusColor, textColor, bgLight, urgent: diffDays <= 3 };
    };

    return (
        <div className="p-4 md:p-12 space-y-10 pb-40 max-w-7xl mx-auto animate-slide-up">
             <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                        {t('subscriptions.title')}
                        <InfoTag title={t('subscriptions.title')} description={t('help.subscriptions')} />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm tracking-wide">{t('subscriptions.subtitle')}</p>
                </div>
            </header>

            {/* Premium Summary Card */}
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 dark:bg-[#1A1A1A] p-10 text-white shadow-2xl border border-slate-800 dark:border-white/10 group">
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-mint/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-3 opacity-80">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <ChipIcon className="w-5 h-5 text-brand-mint" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">التكلفة الثابتة</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{t('subscriptions.monthlyCost')}</p>
                            <h2 className="text-6xl font-black tracking-tighter dir-ltr">{formatCurrency(monthlyTotal)}</h2>
                        </div>
                        <div className="flex gap-3">
                            <span className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-white/5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                {subscriptions.length} {t('subscriptions.active')}
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-white text-black px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3 hover:bg-brand-mint"
                    >
                        <PlusIcon className="w-5 h-5" />
                        {t('subscriptions.add')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub, idx) => {
                    const status = getBillingStatus(sub.nextBillingDate, sub.billingCycle);
                    return (
                        <div key={sub.id} className="group bg-white dark:bg-[#151515] p-2 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-soft hover:shadow-lg transition-all relative overflow-hidden">
                            <div className="bg-slate-50 dark:bg-[#1A1A1A] rounded-[2rem] p-6 h-full flex flex-col justify-between relative overflow-hidden">
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md ${sub.color}`}>
                                        {sub.icon}
                                    </div>
                                    <button 
                                        onClick={() => onDelete(sub.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="space-y-1 mb-6 relative z-10">
                                    <h3 className="font-black text-xl text-slate-900 dark:text-white truncate tracking-tight">{sub.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        {sub.billingCycle === 'monthly' ? (t('transactions.monthly') || 'شهري') : (t('transactions.yearly') || 'سنوي')}
                                    </p>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-end justify-between">
                                        <span className="block font-black text-2xl text-slate-900 dark:text-white dir-ltr">{formatCurrency(sub.amount)}</span>
                                        <div className={`text-[10px] font-black px-3 py-1.5 rounded-lg border border-transparent ${status.bgLight} ${status.textColor}`}>
                                            {status.text}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                            <span>دورة الدفع</span>
                                            <span>{Math.round(status.progress)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${status.color}`} 
                                                style={{ width: `${status.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 mt-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            <span className="dir-ltr">{sub.nextBillingDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white dark:bg-[#12141C] w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95">
                         <div className="flex justify-between items-center mb-8">
                             <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('subscriptions.new')}</h2>
                             <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition"><XIcon className="w-5 h-5 text-slate-500" /></button>
                         </div>
                         
                         <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('subscriptions.serviceName')}</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors" placeholder="Netflix, Gym..." />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('common.amount')}</label>
                                <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors" placeholder="0" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">لون الخدمة</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {BRAND_COLORS.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setSelectedColor(c)}
                                            className={`w-10 h-10 rounded-full shrink-0 ${c.bg} ${selectedColor.id === c.id ? 'ring-4 ring-offset-2 ring-slate-400 dark:ring-white/20 scale-110' : 'opacity-70 hover:opacity-100'} transition-all shadow-sm`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('subscriptions.cycle')}</label>
                                    <select value={cycle} onChange={e => setCycle(e.target.value as any)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer focus:border-brand-mint">
                                        <option value="monthly">{t('transactions.monthly') || 'Monthly'}</option>
                                        <option value="yearly">{t('transactions.yearly') || 'Yearly'}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('subscriptions.nextDue')}</label>
                                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint" />
                                </div>
                            </div>
                            
                            <button type="submit" className="w-full py-6 bg-slate-900 dark:bg-brand-mint text-white dark:text-black rounded-[2rem] font-black text-xl shadow-xl hover:scale-[1.02] transition-transform mt-4 flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-6 h-6" />
                                {t('common.save')}
                            </button>
                         </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
