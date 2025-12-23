
import React from 'react';
import { ShopItem, ThemeColor } from '../types';
import { useLanguage } from './LanguageContext';
import { ShoppingBagIcon, CheckCircleIcon, SparklesIcon } from './Icons';
import InfoTag from './InfoTag';

interface ShopViewProps {
    items: ShopItem[];
    xpBalance: number;
    onBuy: (id: string) => boolean;
    onEquip: (id: string, type: 'theme' | 'icon') => void;
}

const ShopView: React.FC<ShopViewProps> = ({ items, xpBalance, onBuy, onEquip }) => {
    const { t } = useLanguage();

    const handleAction = (item: ShopItem) => {
        if (item.isOwned) {
            if (item.type === 'theme') {
                onEquip(item.value, 'theme');
            }
        } else {
            const success = onBuy(item.id);
            if (success) {
                alert("Purchased successfully!");
            } else {
                alert(t('shop.insufficient'));
            }
        }
    };

    return (
        <div className="p-4 md:p-12 space-y-10 pb-40 max-w-7xl mx-auto animate-slide-up">
            <header className="flex justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        {t('shop.title')} 
                        <InfoTag title={t('shop.title')} description={t('help.shop')} />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold text-sm tracking-wide">{t('shop.subtitle')}</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-3 shadow-sm border border-amber-200 dark:border-amber-900/30">
                    <SparklesIcon className="w-5 h-5" />
                    {xpBalance} XP
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-[#151515] rounded-[2.5rem] p-2 border border-slate-200 dark:border-white/5 shadow-soft hover:-translate-y-2 transition-transform duration-300 group">
                        <div className="bg-slate-50 dark:bg-[#1A1A1A] rounded-[2.2rem] p-8 h-full flex flex-col relative overflow-hidden">
                            
                            {item.isOwned && (
                                <div className="absolute top-6 right-6 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm z-10">
                                    <CheckCircleIcon className="w-3 h-3" /> {t('shop.owned')}
                                </div>
                            )}
                            
                            <div className="flex-1 flex flex-col items-center text-center mb-8 relative z-10">
                                <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center text-5xl mb-6 shadow-xl transition-transform group-hover:scale-110 border-4 border-white dark:border-[#151515]
                                    ${item.type === 'theme' ? `bg-${item.value}-500 text-white` : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'}`}>
                                    {item.type === 'icon' ? item.value : '🎨'}
                                </div>
                                <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2">{item.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed px-4">{item.description}</p>
                            </div>

                            <button 
                                onClick={() => handleAction(item)}
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95
                                    ${item.isOwned 
                                        ? 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10' 
                                        : (xpBalance >= item.cost ? 'bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed')}`}
                            >
                                {item.isOwned ? t('shop.use') : `${t('shop.buy')} (${item.cost} XP)`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopView;
