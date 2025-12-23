
import React from 'react';
import { useLanguage } from './LanguageContext';
import { SparklesIcon, WalletIcon, BotIcon, UsersGroupIcon, EyeIcon, ChipIcon } from './Icons';

const VisionView: React.FC = () => {
    const { t } = useLanguage();

    const pillars = [
        {
            id: 'ai',
            icon: BotIcon,
            color: 'bg-violet-500',
            title: t('vision.pillars.ai'),
            desc: t('vision.pillars.aiDesc')
        },
        {
            id: 'local',
            icon: WalletIcon,
            color: 'bg-emerald-500',
            title: t('vision.pillars.local'),
            desc: t('vision.pillars.localDesc')
        },
        {
            id: 'growth',
            icon: SparklesIcon,
            color: 'bg-amber-500',
            title: t('vision.pillars.growth'),
            desc: t('vision.pillars.growthDesc')
        },
        {
            id: 'privacy',
            icon: EyeIcon,
            color: 'bg-blue-500',
            title: t('vision.pillars.privacy'),
            desc: t('vision.pillars.privacyDesc')
        }
    ];

    return (
        <div className="p-6 md:p-10 space-y-16 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="text-center space-y-8 py-10 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[150px] pointer-events-none"></div>
                
                <div className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-float">
                    <ChipIcon className="w-3.5 h-3.5" />
                    Gemini 2.5 Flash Powered
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    Spend<span className="text-primary-500">Wise.</span>
                </h1>
                
                <p className="text-xl md:text-3xl text-slate-500 dark:text-slate-300 max-w-3xl mx-auto font-bold leading-relaxed px-4">
                    {t('vision.intro')}
                </p>
            </section>

            {/* Product Manifesto */}
            <section className="max-w-4xl mx-auto">
                 <div className="glass-card p-10 md:p-16 rounded-[3rem] border border-primary-500/20 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-indigo-600"></div>
                    <h2 className="text-xs font-black text-primary-500 uppercase tracking-[0.3em] mb-8">The SpendWise Manifesto</h2>
                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 font-medium leading-[1.8] italic">
                        "{t('vision.manifesto')}"
                    </p>
                    <div className="mt-12 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white">Engineering for Dzayer</p>
                            <p className="text-xs text-slate-500">Value-optimized 2.5 Flash Engine</p>
                        </div>
                    </div>
                 </div>
            </section>

            {/* Feature Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pillars.map((p, idx) => (
                    <div 
                        key={p.id} 
                        className="glass-card p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2"
                        style={{ animationDelay: `${idx * 150}ms` }}
                    >
                        <div className={`w-20 h-20 ${p.color} text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl transform group-hover:rotate-12 transition-transform duration-500`}>
                            <p.icon className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{p.title}</h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {p.desc}
                        </p>
                    </div>
                ))}
            </section>

            {/* Technical Context Section */}
            <section className="bg-slate-950 text-white p-10 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] -ml-48 -mb-48"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">Built for <span className="text-primary-400">Algeria's</span> Digital Era.</h2>
                        <div className="space-y-10">
                            <div className="flex gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                    <span className="font-black text-sm text-primary-400">CCP</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-xl mb-2">Automated Ledger</h4>
                                    <p className="text-slate-400 text-lg leading-relaxed">Stop manual logging. Gemini 2.5 Flash understands your BaridiMob notifications and classifies them instantly.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                    <UsersGroupIcon className="w-8 h-8 text-primary-400" />
                                </div>
                                <div>
                                    <h4 className="font-black text-xl mb-2">Digital Tradition</h4>
                                    <p className="text-slate-400 text-lg leading-relaxed">The only app that natively supports "Djam3ia" rotating savings circles, tracking turns and pots for groups.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="glass bg-white/5 border-white/10 rounded-[2.5rem] p-10 transform lg:rotate-3 shadow-2xl relative">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <BotIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Interface v2.5 Flash</span>
                        </div>
                        <div className="font-mono text-sm space-y-3 text-primary-300">
                            <p className="opacity-40 line-through">Traditional accounting...</p>
                            <p className="opacity-70 text-indigo-400">&gt; Stream: Processing BaridiMob SMS...</p>
                            <p className="opacity-90">&gt; Data: 4,500 DZD Inflow detected.</p>
                            <p className="text-white font-bold">&gt; Success: Linked to Account [CCP Main].</p>
                            <p className="text-primary-500 animate-pulse">&gt; AI Engine: Using 2.5 Flash (Optimized)...</p>
                            <p className="animate-pulse">_</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="text-center pt-20 border-t border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 font-black text-xs tracking-[0.5em] uppercase mb-4">Empowering your future.</p>
                <div className="flex justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500/20"></div>
                </div>
            </footer>
        </div>
    );
};

export default VisionView;
