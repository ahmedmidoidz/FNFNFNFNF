
import React, { useState, useMemo } from 'react';
import { Transaction, Account, Subscription } from '../types';
import { useLanguage } from './LanguageContext';
import { ChipIcon, SparklesIcon, TrendingUpIcon } from './Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SimulatorProps {
    transactions: Transaction[];
    subscriptions: Subscription[];
    accounts: Account[];
    formatCurrency: (amount: number) => string;
}

const SimulatorView: React.FC<SimulatorProps> = ({ transactions, subscriptions, accounts, formatCurrency }) => {
    const { t } = useLanguage();
    const [monthsToProject, setMonthsToProject] = useState(12);
    const [monthlySavings, setMonthlySavings] = useState(20000); // Interactive state
    
    // أحداث موسمية تؤثر على المحاكاة
    const seasonalEvents = [
        { name: 'رمضان الكريم', month: 2, impact: 35000 },
        { name: 'الدخول المدرسي', month: 8, impact: 40000 },
        { name: 'عيد الأضحى', month: 5, impact: 60000 }
    ];

    const currentBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const data = useMemo(() => {
        const points: any[] = [];
        let runningBalance = currentBalance;
        for (let i = 0; i <= monthsToProject; i++) {
            const currentMonth = (new Date().getMonth() + i) % 12;
            const event = seasonalEvents.find(e => e.month === currentMonth);
            
            // Formula: Previous Balance + Monthly Savings - Seasonal Impact
            runningBalance += (monthlySavings - (event?.impact || 0));
            
            points.push({
                name: `شهر ${i}`,
                balance: Math.max(0, Math.round(runningBalance)),
                event: event?.name
            });
        }
        return points;
    }, [currentBalance, monthsToProject, monthlySavings]);

    return (
        <div className="p-4 md:p-12 space-y-10 pb-40 max-w-7xl mx-auto animate-slide-up">
            <header>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    {t('nav.simulator')} 
                    <ChipIcon className="w-8 h-8 text-brand-mint" />
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm tracking-wide">آلة الزمن: شوف مستقبلك المالي</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Main Visualization */}
                <div className="lg:col-span-8 bg-white dark:bg-[#151515] p-1 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-soft overflow-hidden">
                    <div className="bg-slate-50 dark:bg-[#1A1A1A] p-8 rounded-[2.8rem] h-[500px] relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-mint"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الرصيد المتوقع بعد عام</p>
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter dir-ltr">
                                    {formatCurrency(data[data.length-1].balance)}
                                </h2>
                            </div>
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3 rounded-2xl">
                                <TrendingUpIcon className="w-6 h-6 text-brand-mint" />
                            </div>
                        </div>

                        <div className="flex-1 w-full dir-ltr relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8C6A4B" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8C6A4B" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', backgroundColor: '#fff', color: '#000' }}
                                        formatter={(value: number) => [formatCurrency(value), 'الرصيد']}
                                        labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="balance" stroke="#8C6A4B" strokeWidth={4} fill="url(#colorSim)" animationDuration={1000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Grid Effect */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
                    </div>
                </div>

                {/* Controls & Insights */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Slider Control */}
                    <div className="bg-white dark:bg-[#151515] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                            مبلغ التوفير الشهري
                        </label>
                        <div className="mb-8 text-center">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">{formatCurrency(monthlySavings)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="200000" 
                            step="1000"
                            value={monthlySavings}
                            onChange={(e) => setMonthlySavings(parseInt(e.target.value))}
                            className="w-full h-6 bg-slate-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-mint"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-4 font-black uppercase tracking-wider">
                            <span>0 دج</span>
                            <span>20 م. سنتيم</span>
                        </div>
                    </div>

                    {/* AI Insight Card */}
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <SparklesIcon className="w-5 h-5 text-indigo-200" />
                                <h3 className="font-black text-sm uppercase tracking-widest text-indigo-200">تحليل الذكاء</h3>
                            </div>
                            <p className="text-lg font-bold leading-relaxed">
                                إذا خبيت <strong>{formatCurrency(monthlySavings)}</strong> كل شهر، راك رايح تلم <strong>{formatCurrency(data[data.length-1].balance)}</strong> منا على عام.
                                <br/><br/>
                                <span className="text-indigo-200 text-xs">ملاحظة: الحساب يشمل مصاريف رمضان والعيد.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulatorView;
