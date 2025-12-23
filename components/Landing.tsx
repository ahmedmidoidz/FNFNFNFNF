
import React from 'react';
import { useLanguage } from './LanguageContext';
import { WalletIcon, BotIcon, SparklesIcon, ChipIcon, LogOutIcon, PlusIcon } from './Icons';

interface LandingProps {
    onStartNew: () => void;
    onStartDemo: () => void;
    onLogin: () => void;
    isOnboarded: boolean;
}

const Landing: React.FC<LandingProps> = ({ onStartNew, onStartDemo, onLogin, isOnboarded }) => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F5F5F0] dark:bg-[#1C1917]">
            {/* Soft Ambient Background */}
            <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-4xl text-center relative z-10 space-y-12 animate-in fade-in duration-700">
                
                {/* Branding Section */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-6 py-2.5 rounded-full shadow-soft border border-slate-200/50 dark:border-slate-700/50 mx-auto backdrop-blur-sm">
                        <SparklesIcon className="w-4 h-4 text-brand-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Next Gen Financial AI</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-brand-600 rounded-[2rem] shadow-xl shadow-brand-500/20 flex items-center justify-center text-white mb-8">
                            <WalletIcon className="w-12 h-12" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
                            Spend<span className="text-brand-600">Wise.</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                            {t('landing.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Simplified CTA Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    
                    <button 
                        onClick={isOnboarded ? onLogin : onStartNew}
                        className="group bg-slate-900 dark:bg-[#292524] p-8 rounded-[2.5rem] shadow-premium hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center text-center gap-4 border border-transparent dark:border-white/10"
                    >
                        <div className="w-14 h-14 bg-brand-600 text-white dark:bg-white dark:text-brand-600 rounded-2xl flex items-center justify-center">
                            {isOnboarded ? <LogOutIcon className="w-7 h-7 rotate-180" /> : <PlusIcon className="w-7 h-7" />}
                        </div>
                        <div>
                            <span className="block font-black text-xl text-white">{isOnboarded ? t('landing.loginExisting') : t('landing.startFromScratch')}</span>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{isOnboarded ? 'حسابك جاهز' : 'ابدأ رحلتك'}</p>
                        </div>
                    </button>

                    <button 
                        onClick={onStartDemo}
                        className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-soft hover:border-brand-500 transition-all flex flex-col items-center text-center gap-4"
                    >
                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-brand-600 rounded-2xl flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                            <BotIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <span className="block font-black text-xl text-slate-900 dark:text-white">{t('landing.tryDemo')}</span>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{t('landing.demoNote')}</p>
                        </div>
                    </button>
                </div>

                <p className="text-slate-400 font-bold text-sm opacity-60">
                     {t('landing.tagline')}
                </p>
            </div>
            
            <p className="absolute bottom-10 text-slate-300 dark:text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">Design for Excellence © 2025</p>
        </div>
    );
};

export default Landing;
