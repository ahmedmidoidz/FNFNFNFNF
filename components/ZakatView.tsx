
import React, { useState, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { GoldIcon } from './Icons';
import InfoTag from './InfoTag';
import { Account } from '../types';

interface ZakatViewProps {
    accounts: Account[];
    formatCurrency: (amount: number) => string;
}

const ZakatView: React.FC<ZakatViewProps> = ({ accounts, formatCurrency }) => {
    const { t } = useLanguage();
    const [goldPrice, setGoldPrice] = useState(11000); // Price per gram in DZD
    const [otherAssets, setOtherAssets] = useState('');
    const [immediateDebts, setImmediateDebts] = useState('');

    const NISAB_GRAMS = 85;
    const nisabValue = goldPrice * NISAB_GRAMS;

    const totalCash = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
    
    const netWealth = useMemo(() => {
        const assets = parseFloat(otherAssets) || 0;
        const debts = parseFloat(immediateDebts) || 0;
        return totalCash + assets - debts;
    }, [totalCash, otherAssets, immediateDebts]);

    const zakatDue = netWealth >= nisabValue ? netWealth * 0.025 : 0;
    const progressToNisab = Math.min((netWealth / nisabValue) * 100, 100);

    return (
        <div className="p-4 md:p-10 space-y-10 pb-32 max-w-5xl mx-auto animate-slide-up">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                    {t('nav.zakat')}
                    <InfoTag title={t('nav.zakat')} description={t('help.zakat')} />
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm tracking-wide">حاسبة زكاة المال (ربع العشر - 2.5%)</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Inputs Panel */}
                <div className="space-y-6">
                    {/* Gold Price Card */}
                    <div className="bg-white dark:bg-[#151515] p-8 rounded-[2.5rem] border border-amber-200 dark:border-amber-900/30 shadow-soft relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <label className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em]">سعر الذهب (غرام 24)</label>
                            <GoldIcon className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="relative z-10">
                            <input 
                                type="number" 
                                value={goldPrice}
                                onChange={(e) => setGoldPrice(parseFloat(e.target.value))}
                                className="w-full text-4xl font-black bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-200"
                            />
                            <p className="text-xs font-bold text-slate-400 mt-2">النصاب الحالي: <span className="text-amber-600 dark:text-amber-400">{formatCurrency(nisabValue)}</span></p>
                        </div>
                    </div>

                    {/* Assets Form */}
                    <div className="bg-white dark:bg-[#151515] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-soft space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي السيولة (تلقائي)</label>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center">
                                <span className="font-black text-xl text-slate-900 dark:text-white">{formatCurrency(totalCash)}</span>
                                <span className="text-[10px] font-black text-brand-mint bg-brand-mint/10 px-2 py-1 rounded">من الحسابات</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">أصول أخرى (ذهب مدخر، عروض تجارة)</label>
                            <input 
                                type="number" 
                                value={otherAssets}
                                onChange={(e) => setOtherAssets(e.target.value)}
                                className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-colors"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">ديون حالية عليك (تخصم)</label>
                            <input 
                                type="number" 
                                value={immediateDebts}
                                onChange={(e) => setImmediateDebts(e.target.value)}
                                className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-red-400 transition-colors"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Result Panel */}
                <div className="flex flex-col gap-6 h-full">
                    {/* The Cheque/Certificate Card */}
                    <div className={`flex-1 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-center items-center text-center shadow-2xl transition-all duration-700 border-4 
                        ${zakatDue > 0 
                            ? 'bg-[#064e3b] border-[#059669] text-white' 
                            : 'bg-slate-100 dark:bg-[#1A1A1A] border-slate-200 dark:border-white/5 text-slate-400'}`}>
                        
                        {/* Ornamental Background Pattern */}
                        {zakatDue > 0 && (
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        )}
                        
                        <div className="relative z-10 space-y-6">
                            <span className="inline-block py-1 px-3 rounded-full border border-current text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
                                {zakatDue > 0 ? 'مستحقة الأداء' : 'لم يبلغ النصاب'}
                            </span>
                            
                            <div>
                                <h2 className="text-xl font-bold opacity-90 mb-2">قيمة الزكاة</h2>
                                <div className="text-6xl font-black tracking-tighter drop-shadow-md">
                                    {formatCurrency(zakatDue)}
                                </div>
                            </div>
                            
                            <p className="text-sm font-medium opacity-80 max-w-xs mx-auto leading-relaxed">
                                {zakatDue > 0 ? 'طهر مالك وبارك فيه بإخراج هذا المبلغ لمستحقيه.' : 'نسأل الله أن يبارك لك في مالك ويرزقك من واسع فضله.'}
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-white dark:bg-[#151515] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-soft">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white">حالة النصاب</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">صافي الثروة: {formatCurrency(Math.max(0, netWealth))}</p>
                            </div>
                            <span className={`text-xl font-black ${zakatDue > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {progressToNisab.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                            <div 
                                className={`h-full transition-all duration-1000 ease-out ${zakatDue > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                style={{ width: `${progressToNisab}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZakatView;
