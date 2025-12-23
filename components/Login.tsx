
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { WalletIcon, BotIcon } from './Icons';

interface LoginProps {
    onLogin: () => void;
    onTryDemo?: () => void;
    expectedPin?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onTryDemo, expectedPin = '1234' }) => {
    const { t } = useLanguage();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === expectedPin) {
            onLogin();
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F5F5F0] dark:bg-[#1C1917]">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-mint/5 dark:bg-brand-mint/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-heat/5 dark:bg-brand-heat/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="glass-heavy p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-sm text-center relative z-10 border border-slate-200 dark:border-white/5">
                <div className="w-24 h-24 bg-slate-900 dark:bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-8 text-white dark:text-slate-900">
                    <WalletIcon className="w-10 h-10" />
                </div>
                
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{t('login.welcome')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-bold text-sm tracking-wide uppercase">{t('login.enterPin')}</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative">
                        <input 
                            type="password" 
                            maxLength={4}
                            value={pin}
                            onChange={e => { setPin(e.target.value); setError(false); }}
                            className="w-full text-center text-4xl font-black tracking-[0.5em] py-5 bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-3xl focus:outline-none focus:border-brand-mint transition-all text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-white/10 shadow-inner"
                            placeholder="••••"
                            autoFocus
                        />
                        {error && <p className="absolute -bottom-8 left-0 right-0 text-red-500 text-xs font-black uppercase tracking-widest animate-bounce">{t('login.error')}</p>}
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {t('login.unlock')}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => { if (onTryDemo) { onTryDemo(); onLogin(); } }}
                        className="w-full py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-brand-mint transition-colors flex items-center justify-center gap-2"
                    >
                        <BotIcon className="w-4 h-4" />
                        {t('login.tryDemo')}
                    </button>
                </form>
            </div>
            
            <p className="absolute bottom-8 text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Secure Access</p>
        </div>
    );
};

export default Login;
