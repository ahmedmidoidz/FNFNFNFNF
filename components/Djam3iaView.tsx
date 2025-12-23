
import React, { useState } from 'react';
import { Djam3ia, Account, Djam3iaMember } from '../types';
import { useLanguage } from './LanguageContext';
import { PlusIcon, UsersGroupIcon, XIcon, CheckCircleIcon, MessageCircleIcon, ClockIcon } from './Icons';

interface Djam3iaViewProps {
    djam3ias: Djam3ia[];
    accounts: Account[];
    onAdd: (d: Omit<Djam3ia, 'id'>) => void;
    onPayInstallment: (djam3iaId: string, accountId: string, memberId?: string) => void;
    formatCurrency: (amount: number) => string;
}

const Djam3iaView: React.FC<Djam3iaViewProps> = ({ djam3ias, accounts, onAdd, onPayInstallment, formatCurrency }) => {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    
    // Quick Add State (simplified)
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleRemind = (member: Djam3iaMember, djamName: string) => {
        const message = `أهلاً ${member.name}، حبيت نذكرك بلي قسط الجمعية (${djamName}) لهذا الشهر راه مستحق. ربي يبارك في مالك!`;
        window.open(`https://wa.me/${member.phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="p-4 md:p-12 space-y-10 pb-40 max-w-7xl mx-auto animate-slide-up">
             <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('nav.djam3ia')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">تسيير الجمعيات التقليدية (الدارت)</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform border border-white/10">
                    <PlusIcon className="w-4 h-4" />
                    جمعية جديدة
                </button>
            </header>

            <div className="grid grid-cols-1 gap-12">
                {djam3ias.map(d => (
                    <div key={d.id} className="bg-white dark:bg-[#151515] rounded-[3rem] p-1.5 border border-slate-200 dark:border-white/5 shadow-soft relative overflow-hidden group">
                        
                        <div className="bg-slate-50 dark:bg-[#1A1A1A] rounded-[2.8rem] p-8 md:p-10 relative z-10 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                                <div className="flex gap-6 items-center">
                                    <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white">
                                        <UsersGroupIcon className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{d.name}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-1.5 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                                المجموع: {formatCurrency(d.totalAmount)}
                                            </span>
                                            <span className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-1.5 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                                القسط: {formatCurrency(d.monthlyPayment)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div className="bg-white dark:bg-[#151515] rounded-3xl p-5 border border-slate-100 dark:border-white/5 flex items-center gap-4 shadow-sm w-full md:w-auto">
                                    <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400">
                                        <ClockIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white mb-2 w-48">
                                            <span>اكتمال الدورة</span>
                                            <span>25%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-mint w-1/4 rounded-full shadow-[0_0_10px_var(--color-primary-500)]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Timeline Track */}
                            <div className="relative flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 md:px-0">
                                <div className="flex items-start gap-0 min-w-max pt-8 pb-4">
                                    {d.members?.map((m, index) => {
                                        const isMyTurn = index + 1 === d.myTurnMonth; // Simplified logic
                                        const hasPaid = m.paidMonths.length > 0; // Simplified
                                        
                                        return (
                                            <div key={m.id} className="relative flex flex-col items-center w-40 group">
                                                
                                                {/* Connecting Line */}
                                                {index !== d.members.length - 1 && (
                                                    <div className="absolute top-6 left-1/2 w-full h-1 bg-slate-200 dark:bg-white/5 -z-10"></div>
                                                )}

                                                {/* Node */}
                                                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-sm z-10 transition-all duration-300 mb-6
                                                    ${hasPaid ? 'bg-brand-mint border-white dark:border-[#1A1A1A] text-black shadow-lg scale-110' : 
                                                      isMyTurn ? 'bg-white dark:bg-white border-brand-mint text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-125' : 
                                                      'bg-slate-200 dark:bg-white/10 border-white dark:border-[#1A1A1A] text-slate-400'}`}>
                                                    {index + 1}
                                                </div>

                                                {/* Date Label */}
                                                <span className="text-[9px] font-black text-slate-400 bg-white dark:bg-[#151515] px-2 py-1 rounded-lg border border-slate-100 dark:border-white/5 mb-3">
                                                    {new Date(new Date().setMonth(new Date().getMonth() + index)).toLocaleDateString('ar-DZ', { month: 'short' })}
                                                </span>

                                                {/* Member Card */}
                                                <div className={`w-32 p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-3
                                                    ${isMyTurn 
                                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl transform -translate-y-2' 
                                                        : 'bg-white dark:bg-[#151515] border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-brand-mint'}`}>
                                                    
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="font-bold text-sm truncate w-full">{m.name}</span>
                                                        {isMyTurn && <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 dark:bg-black/10 px-2 py-0.5 rounded">أنا</span>}
                                                    </div>
                                                    
                                                    <div className="flex gap-2 w-full mt-1">
                                                        <button onClick={() => handleRemind(m, d.name)} className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-colors ${isMyTurn ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100'}`}>
                                                            <MessageCircleIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => onPayInstallment(d.id, accounts[0].id, m.id)} className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-colors ${isMyTurn ? 'bg-brand-mint text-black' : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-80'}`}>
                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

             {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white dark:bg-[#12141C] w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-white/20 animate-in zoom-in-95 relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white">تأسيس جمعية</h2>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-full text-slate-400 hover:text-brand-heat transition-all"><XIcon className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); /* Demo only */ setShowModal(false); }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">اسم الجمعية</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors" placeholder="مثال: جمعية العائلة" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">قيمة القسط</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors" placeholder="0" />
                            </div>
                            <button type="submit" className="w-full py-6 bg-slate-900 dark:bg-brand-mint text-white dark:text-black rounded-[2rem] font-black text-xl shadow-xl hover:scale-[1.02] transition-transform mt-2">بدء الدورة</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Djam3iaView;
