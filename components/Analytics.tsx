import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { Transaction } from '../types';
import { useLanguage } from './LanguageContext';
import { TrendingUpIcon, BotIcon, ShoppingBagIcon, SparklesIcon } from './Icons';
import { generateFinancialReport } from '../services/geminiService';

interface AnalyticsProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

const Analytics: React.FC<AnalyticsProps> = React.memo(({ transactions, formatCurrency }) => {
  const { t, language } = useLanguage();
  const [aiReport, setAiReport] = useState<{ score: number; advice: string; status: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const comparisonData = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const thisMonthTotal = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === thisMonth)
        .reduce((s: number, t) => s + t.amount, 0);

    const lastMonthTotal = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === lastMonth)
        .reduce((s: number, t) => s + t.amount, 0);

    const diff = thisMonthTotal - lastMonthTotal;
    const pct = lastMonthTotal > 0 ? (diff / lastMonthTotal) * 100 : 0;

    return { thisMonthTotal, lastMonthTotal, pct };
  }, [transactions]);

  const chartData = useMemo(() => {
      const today = new Date();
      const points: any[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dailyTotal = transactions
          .filter(t => t.date === dateStr && t.type === 'expense')
          .reduce((acc, curr) => acc + curr.amount, 0);
        
        points.push({
          date: d.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', { day: 'numeric', month: 'short' }),
          amount: dailyTotal
        });
      }
      return points;
  }, [transactions, language]);

  const categoryData = useMemo(() => {
    const map = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc: Record<string, number>, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

    return Object.entries(map).map(([name, amount]) => ({
        name: t(`categories.${name}`) || name,
        amount: amount as number
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions, t]);

  // Top Merchants Analysis
  const merchantData = useMemo(() => {
    const map = transactions
        .filter(t => t.type === 'expense' && t.merchant)
        .reduce((acc: Record<string, number>, curr) => {
             const m = curr.merchant.trim();
             acc[m] = (acc[m] || 0) + curr.amount;
             return acc;
        }, {} as Record<string, number>);

    return Object.entries(map)
        .map(([name, amount]) => ({ name, amount: amount as number }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
  }, [transactions]);

  const handleGenerateReport = async () => {
      if (aiReport) return;
      setIsAiLoading(true);
      // Construct a summary object from available data
      // Note: In a real scenario, you'd pass full context props. Here we approximate for demo.
      const income = transactions.filter(t => t.type === 'income').reduce((s: number, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((s: number, t) => s + t.amount, 0);
      const fakeContext = {
          stats: { balance: income - expense, income, expense },
          debts: [], // Would need to be passed in props for full accuracy
          subscriptions: []
      };
      
      const report = await generateFinancialReport(fakeContext);
      setAiReport(report);
      setIsAiLoading(false);
  };

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in pb-32 max-w-[1200px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="text-right">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('analytics.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{t('analytics.subtitle')}</p>
        </div>
        
        <div className="bg-slate-900 dark:bg-[#1A1A1A] text-white px-8 py-4 rounded-[2rem] shadow-premium flex items-center gap-5 border border-slate-300 dark:border-white/10">
            <div className={`p-2.5 rounded-xl ${comparisonData.pct > 0 ? 'bg-brand-heat/20 text-brand-heat' : 'bg-brand-mint/20 text-brand-mint'}`}>
                <TrendingUpIcon className={`w-6 h-6 ${comparisonData.pct > 0 ? '' : 'rotate-180'}`} />
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">مقارنة بالشهر الماضي</p>
                <p className="text-xl font-black">{comparisonData.pct > 0 ? '+' : ''}{comparisonData.pct.toFixed(1)}%</p>
            </div>
        </div>
      </header>

      {/* NEW: AI Financial Analyst Section */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                          <BotIcon className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Scorpion Analyst</h2>
                  </div>
                  
                  {!aiReport ? (
                      <div>
                          <p className="text-indigo-200 text-lg font-medium leading-relaxed mb-8 max-w-xl">
                              هل تريد تقريراً شاملاً عن وضعك المالي؟ دع ذكاء Scorpion يحلل كل تحركاتك ويعطيك خطة عمل.
                          </p>
                          <button 
                            onClick={handleGenerateReport}
                            disabled={isAiLoading}
                            className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                          >
                              {isAiLoading ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                              {isAiLoading ? 'جاري التحليل...' : 'تحليل وضعي المالي الآن'}
                          </button>
                      </div>
                  ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="text-5xl font-black">{aiReport.score}<span className="text-2xl opacity-60">/100</span></div>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${aiReport.score > 70 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'}`}>
                                  {aiReport.status}
                              </span>
                          </div>
                          <p className="text-lg font-bold leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                              "{aiReport.advice}"
                          </p>
                      </div>
                  )}
              </div>
              {/* Visual Graphic */}
              <div className="hidden md:block w-64 h-64 bg-white/5 rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-4 border-white/20 rounded-full border-t-white animate-spin duration-[3s]"></div>
                  <SparklesIcon className="w-24 h-24 text-white/20" />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Chart Card */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-300 dark:border-slate-800 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-mint"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10">منحنى المصاريف (30 يوم)</h3>
            <div className="h-80 w-full dir-ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8C6A4B" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#8C6A4B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a8a29e'}} dy={10} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: '#fff' }} />
                        <Area type="monotone" dataKey="amount" stroke="#8C6A4B" strokeWidth={4} fill="url(#colorAmt)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Categories Card */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-300 dark:border-slate-800 shadow-soft h-full flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8">توزيع الفئات</h3>
                <div className="space-y-6 flex-1">
                    {categoryData.slice(0, 5).map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                            <div className="text-right">
                                <span className="text-sm font-black text-slate-800 dark:text-white block">{cat.name}</span>
                                <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-brand-mint rounded-full transition-all duration-1000" style={{ width: `${Math.min((cat.amount / comparisonData.thisMonthTotal) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            <span className="text-sm font-black text-slate-400 group-hover:text-brand-mint transition-colors">{formatCurrency(cat.amount)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Top Merchants Card - New Section */}
        <div className="lg:col-span-12">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border-2 border-slate-300 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingBagIcon className="w-6 h-6 text-slate-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">أكثر المحلات استهلاكاً لأموالك</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {merchantData.map((m, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center border border-slate-300 dark:border-transparent">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 mb-3 text-lg border border-slate-200 dark:border-transparent">
                                {idx + 1}
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white truncate w-full">{m.name}</h4>
                            <p className="text-brand-mint font-black mt-1 text-sm">{formatCurrency(m.amount)}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-[2rem] flex items-start gap-4 border border-slate-300 dark:border-slate-700 shadow-sm">
                    <BotIcon className="w-6 h-6 text-brand-mint" />
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed text-right">
                        ذكاء SpendWise: يبدو أن {merchantData[0]?.name} يأخذ حصة كبيرة من ميزانيتك هذا الشهر. حاول تقليل الزيارات بنسبة 20% لتوفير المزيد.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
});

export default Analytics;