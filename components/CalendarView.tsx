
import React, { useState } from 'react';
import { Transaction, Subscription } from '../types';
import { useLanguage } from './LanguageContext';
import { XIcon, CalendarIcon, ArrowDownIcon } from './Icons';

interface CalendarViewProps {
    transactions: Transaction[];
    subscriptions?: Subscription[];
    formatCurrency: (amount: number) => string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ transactions, subscriptions = [], formatCurrency }) => {
    const { t, language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    
    const transactionsByDate = transactions.reduce((acc, txn) => {
        if (!acc[txn.date]) acc[txn.date] = [];
        acc[txn.date].push(txn);
        return acc;
    }, {} as Record<string, Transaction[]>);

    const subscriptionsByDate = subscriptions.reduce((acc, sub) => {
        const subDate = new Date(sub.nextBillingDate);
        let targetDateStr = '';

        if (sub.billingCycle === 'monthly') {
            const day = subDate.getDate();
            const projectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            if (projectedDate.getMonth() === currentDate.getMonth()) {
                 targetDateStr = projectedDate.toISOString().split('T')[0];
            }
        } else if (sub.billingCycle === 'yearly') {
             if (subDate.getMonth() === currentDate.getMonth() && subDate.getFullYear() === currentDate.getFullYear()) {
                 targetDateStr = subDate.toISOString().split('T')[0];
             }
        }

        if (targetDateStr) {
            if (!acc[targetDateStr]) acc[targetDateStr] = [];
            acc[targetDateStr].push(sub);
        }
        
        return acc;
    }, {} as Record<string, Subscription[]>);

    const renderCalendarDays = () => {
        const days: React.ReactNode[] = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[100px] md:min-h-[120px] bg-slate-50/30 dark:bg-black/20 border-r border-b border-slate-100 dark:border-white/5"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTransactions = transactionsByDate[dateStr] || [];
            const daySubscriptions = subscriptionsByDate[dateStr] || [];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            
            const dailyTotal = dayTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const hasData = dayTransactions.length > 0 || daySubscriptions.length > 0;

            days.push(
                <div 
                    key={day} 
                    onClick={() => hasData && setSelectedDate(dateStr)}
                    className={`min-h-[100px] md:min-h-[120px] border-r border-b border-slate-100 dark:border-white/5 relative group transition-all cursor-pointer p-2 flex flex-col justify-between
                        ${hasData ? 'bg-white dark:bg-[#151515] hover:bg-slate-50 dark:hover:bg-white/5' : 'bg-white/50 dark:bg-[#151515]/50'}
                        ${selectedDate === dateStr ? 'ring-2 ring-inset ring-brand-mint z-10' : ''}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-400'}`}>
                            {day}
                        </span>
                        {daySubscriptions.length > 0 && (
                             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        )}
                    </div>
                    
                    <div className="space-y-1">
                        {dailyTotal > 0 && (
                            <span className="block text-[10px] font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-center truncate">
                                -{formatCurrency(dailyTotal)}
                            </span>
                        )}
                        <div className="flex gap-0.5 justify-center flex-wrap">
                            {dayTransactions.slice(0, 5).map((txn, i) => (
                                <div key={i} className={`w-1 h-1 rounded-full ${txn.type === 'income' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        return days;
    };

    const daysOfWeek = language === 'ar' ? ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const locale = language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US';

    return (
        <div className="p-4 md:p-10 pb-32 max-w-7xl mx-auto h-full flex flex-col animate-slide-up">
            <header className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t('calendar.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{t('calendar.subtitle')}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-[#151515] p-2 rounded-2xl shadow-soft border border-slate-200 dark:border-white/5">
                    <button onClick={prevMonth} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors font-bold text-slate-500">←</button>
                    <span className="font-black text-lg w-40 text-center text-slate-900 dark:text-white uppercase tracking-wider">
                        {currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors font-bold text-slate-500">→</button>
                </div>
            </header>

            <div className="bg-white dark:bg-[#151515] rounded-[2.5rem] overflow-hidden shadow-soft border border-slate-200 dark:border-white/5 flex-1 flex flex-col">
                {/* Header Grid */}
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-[#1A1A1A] border-b border-slate-200 dark:border-white/5">
                    {daysOfWeek.map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {day}
                        </div>
                    ))}
                </div>
                {/* Days Grid */}
                <div className="grid grid-cols-7 flex-1">
                    {renderCalendarDays()}
                </div>
            </div>

            {selectedDate && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedDate(null)}></div>
                    <div className="bg-white dark:bg-[#12141C] w-full max-w-md rounded-[3rem] p-0 shadow-2xl relative z-10 animate-in zoom-in-95 border border-white/20 max-h-[80vh] flex flex-col overflow-hidden">
                        
                        <div className="p-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                                    {new Date(selectedDate).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('calendar.activity')}</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-3 bg-white dark:bg-white/10 rounded-full hover:scale-105 transition shadow-sm border border-slate-100 dark:border-white/5">
                                <XIcon className="w-5 h-5 text-slate-500 dark:text-white" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            {/* Bills Section */}
                            {subscriptionsByDate[selectedDate]?.length > 0 && (
                                <div>
                                     <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">{t('calendar.billsDue')}</h4>
                                     <div className="space-y-3">
                                        {subscriptionsByDate[selectedDate].map(sub => (
                                            <div key={sub.id} className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${sub.color}`}>
                                                    {sub.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">{sub.name}</p>
                                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">اشتراك</p>
                                                </div>
                                                <span className="font-black text-indigo-600 dark:text-indigo-400">
                                                    {formatCurrency(sub.amount)}
                                                </span>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            )}

                            {/* Transactions Section */}
                            {transactionsByDate[selectedDate]?.length > 0 && (
                                <div>
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">تحركات اليوم</h4>
                                    <div className="space-y-3">
                                        {transactionsByDate[selectedDate].map(t => (
                                            <div key={t.id} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1A1A1A] rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-black/5
                                                    ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    {t.type === 'income' ? '💰' : '🛒'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-slate-900 dark:text-white text-sm truncate">{t.merchant}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.category}</p>
                                                </div>
                                                <span className={`font-black text-sm whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {(!transactionsByDate[selectedDate]?.length && !subscriptionsByDate[selectedDate]?.length) && (
                                <div className="text-center py-10 text-slate-400">
                                    <p className="font-bold">لا توجد نشاطات في هذا اليوم</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
