
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { AppSettings, Account } from '../types';
import { WalletIcon, CheckCircleIcon, PlusIcon } from './Icons';

interface OnboardingProps {
    onComplete: (settings: Partial<AppSettings>, initialAccount: Account) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { t, setLanguage, language } = useLanguage();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('DZD');
    const [balance, setBalance] = useState('');

    const currencies = [
        { code: 'DZD', symbol: 'د.ج', name: t('currencies.DZD') },
        { code: 'USD', symbol: '$', name: t('currencies.USD') },
        { code: 'EUR', symbol: '€', name: t('currencies.EUR') },
    ];

    const handleNext = () => {
        if (step === 1 && !name.trim()) return;
        if (step === 3) {
            const symbol = currencies.find(c => c.code === currency)?.symbol || '$';
            onComplete(
                { 
                    userName: name, 
                    currency, 
                    currencySymbol: symbol,
                    isOnboarded: true 
                },
                {
                    id: 'acc_main',
                    name: t('onboarding.mainWallet'),
                    type: 'Cash',
                    balance: parseFloat(balance) || 0,
                    currency,
                    color: 'bg-emerald-500'
                }
            );
        } else {
            setStep(step + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 min-h-screen">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] animate-blob"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-blob delay-2000"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Progress */}
                <div className="flex justify-center gap-2 mb-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-primary-600' : 'w-4 bg-slate-200 dark:bg-slate-700'}`}></div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-500/20">
                                <span className="text-5xl">👋</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{t('onboarding.welcome')}</h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400">{t('onboarding.setup')}</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('onboarding.nameLabel')}</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="flex-1 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 rounded-2xl text-xl font-bold outline-none transition-all shadow-lg shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white"
                                        placeholder={t('onboarding.namePlaceholder')}
                                        autoFocus
                                    />
                                    <div className="relative">
                                        <select 
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value as any)}
                                            className="h-full px-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-xl outline-none focus:border-primary-500 transition-all appearance-none text-center cursor-pointer min-w-[80px] shadow-lg shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white"
                                        >
                                            <option value="ar">🇩🇿</option>
                                            <option value="fr">🇫🇷</option>
                                            <option value="en">🇺🇸</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                         <div className="text-center mb-10">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                                <WalletIcon className="w-12 h-12" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{t('onboarding.currencyTitle')}</h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400">{t('onboarding.currencyDesc')}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {currencies.map(c => (
                                <button
                                    key={c.code}
                                    onClick={() => setCurrency(c.code)}
                                    className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all shadow-sm ${currency === c.code ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${currency === c.code ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                            {c.symbol}
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-bold text-lg ${currency === c.code ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{c.code}</p>
                                            <p className="text-sm text-slate-400">{c.name}</p>
                                        </div>
                                    </div>
                                    {currency === c.code && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                         <div className="text-center mb-10">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
                                <span className="text-5xl">💰</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{t('onboarding.balanceTitle')}</h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400">{t('onboarding.balanceDesc')}</p>
                        </div>

                        <div className="relative">
                            <span className="absolute start-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">{currencies.find(c => c.code === currency)?.symbol}</span>
                            <input 
                                type="number" 
                                value={balance}
                                onChange={e => setBalance(e.target.value)}
                                className="w-full ps-16 pe-6 py-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 rounded-3xl text-4xl font-black outline-none transition-all shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white"
                                placeholder={t('onboarding.balancePlaceholder')}
                                autoFocus
                            />
                        </div>
                        <p className="text-center text-sm text-slate-400 mt-6">{t('onboarding.later')}</p>
                    </div>
                )}

                <div className="mt-12 flex justify-between items-center">
                    {step > 1 ? (
                         <button onClick={() => setStep(step - 1)} className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 px-4 py-2 transition-colors">{t('onboarding.back')}</button>
                    ) : <div></div>}
                    
                    <button 
                        onClick={handleNext}
                        disabled={step === 1 && !name.trim()}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {step === 3 ? t('onboarding.finish') : t('onboarding.next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
