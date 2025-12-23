
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { SparklesIcon, CheckCircleIcon, XIcon, ChipIcon } from './Icons';
import { AppSettings } from '../types';

interface PricingProps {
    settings: AppSettings;
}

const Pricing: React.FC<PricingProps> = ({ settings }) => {
    const { t } = useLanguage();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleSubscribe = () => {
        // Dummy action - just visual feedback
        alert("هذه نسخة تجريبية فقط. لن يتم خصم أي مبلغ.");
    };

    // Calculate display price based on currency to make it look realistic
    const getPrice = (type: 'monthly' | 'yearly') => {
        const isDZD = settings.currency === 'DZD';
        
        if (type === 'monthly') {
            return isDZD ? '500' : '4.99';
        } else {
            return isDZD ? '5000' : '49.99';
        }
    };

    const currencySymbol = settings.currencySymbol;

    return (
        <div className="p-4 md:p-12 space-y-12 pb-32 max-w-6xl mx-auto animate-slide-up">
            <header className="text-center space-y-4 mb-10">
                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/10 px-4 py-1.5 rounded-full mb-4 border border-slate-200 dark:border-white/5">
                    <ChipIcon className="w-4 h-4 text-brand-mint" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Upgrade Your Life</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t('pricing.title')}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">{t('pricing.subtitle')}</p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-6 mt-8">
                    <span className={`text-sm font-black transition-colors ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{t('pricing.monthly')}</span>
                    <button 
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className={`w-16 h-9 rounded-full transition-colors relative shadow-inner ${billingCycle === 'yearly' ? 'bg-brand-mint' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        <div className={`w-7 h-7 rounded-full bg-white shadow-md absolute top-1 transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`}></div>
                    </button>
                    <span className={`text-sm font-black transition-colors ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {t('pricing.yearly')}
                        <span className="mr-2 text-[9px] text-white bg-brand-heat px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">{t('pricing.save20')}</span>
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                
                {/* Free Plan */}
                <div className="bg-white dark:bg-[#151515] rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 dark:border-white/5 shadow-soft hover:shadow-lg transition-all duration-500 flex flex-col relative group">
                    <div className="mb-8">
                        <span className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em]">
                            {t('pricing.features.basic')}
                        </span>
                    </div>
                    <div className="mb-8">
                         <span className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{currencySymbol}0</span>
                         <span className="text-slate-400 font-bold block mt-2 text-sm uppercase tracking-widest">/ {t('pricing.features.basic')}</span>
                    </div>
                    
                    <div className="space-y-5 flex-1 mb-10">
                        <FeatureItem text={t('pricing.features.unlimitedTxns')} active />
                        <FeatureItem text={t('pricing.features.basicAi')} active />
                        <FeatureItem text={t('pricing.features.multiWallet')} active />
                        <FeatureItem text={t('pricing.features.receiptScan')} excluded />
                        <FeatureItem text={t('pricing.features.advancedAi')} excluded />
                        <FeatureItem text={t('pricing.features.family')} excluded />
                    </div>

                    <button disabled className="w-full py-5 rounded-[2rem] bg-slate-100 dark:bg-white/5 text-slate-400 font-black cursor-default uppercase tracking-widest text-xs">
                        {t('pricing.currentPlan')}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="relative bg-slate-900 dark:bg-[#1A1A1A] rounded-[3rem] p-1 shadow-2xl flex flex-col group hover:-translate-y-2 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-brand-mint rounded-[3rem] blur-sm opacity-50 group-hover:opacity-80 transition-opacity"></div>
                    <div className="relative h-full bg-slate-900 dark:bg-[#1A1A1A] rounded-[2.8rem] p-8 md:p-12 flex flex-col overflow-hidden">
                        
                        <div className="absolute top-0 left-0 bg-gradient-to-br from-brand-mint to-emerald-500 text-slate-900 text-[10px] font-black px-6 py-3 rounded-br-[2rem] uppercase tracking-[0.2em] shadow-lg z-10">
                            {t('pricing.popular')}
                        </div>

                        <div className="mb-8 mt-4 flex items-center gap-3">
                             <span className="text-white text-3xl">🚀</span>
                             <span className="text-white text-lg font-black uppercase tracking-widest">{t('pricing.features.pro')}</span>
                        </div>
                        
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                                    {currencySymbol}{getPrice(billingCycle)}
                                </span>
                            </div>
                            <span className="text-slate-400 font-bold block mt-2 text-sm uppercase tracking-widest">/ {billingCycle === 'monthly' ? t('pricing.monthly') : t('pricing.yearly')}</span>
                        </div>

                        <div className="space-y-5 flex-1 mb-10">
                            <FeatureItem text={t('pricing.features.unlimitedTxns')} active dark />
                            <FeatureItem text={t('pricing.features.advancedAi')} active dark />
                            <FeatureItem text={t('pricing.features.receiptScan')} active dark />
                            <FeatureItem text={t('pricing.features.family')} active dark />
                            <FeatureItem text={t('pricing.features.export')} active dark />
                            <FeatureItem text={t('pricing.features.customThemes')} active dark />
                        </div>

                        <button 
                            onClick={handleSubscribe}
                            className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-brand-mint to-emerald-400 text-slate-900 font-black shadow-lg shadow-brand-mint/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            {t('pricing.subscribe')}
                            <SparklesIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
            
            <p className="text-center text-[10px] font-bold text-slate-400 mt-12 uppercase tracking-widest opacity-60">
                Cancel anytime. Secure payment via CIB/Edahabia (Coming Soon).
            </p>
        </div>
    );
};

const FeatureItem = ({ text, active = false, excluded = false, dark = false }: { text: string, active?: boolean, excluded?: boolean, dark?: boolean }) => (
    <div className={`flex items-center gap-4 ${excluded ? 'opacity-40 grayscale' : ''}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${active ? (dark ? 'bg-brand-mint text-slate-900' : 'bg-slate-900 text-white dark:bg-white dark:text-black') : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
            {excluded ? <XIcon className="w-3 h-3" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
        </div>
        <span className={`text-xs font-bold ${dark ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>{text}</span>
    </div>
);

export default Pricing;
