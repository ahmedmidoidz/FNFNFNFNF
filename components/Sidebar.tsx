
import React from 'react';
import { 
  HomeIcon, ListIcon, PieChartIcon, SettingsIcon,
  UsersGroupIcon, LogOutIcon, HandCoinsIcon,
  CalendarIcon, ChipIcon, TrendingUpIcon, WalletIcon,
  FileTextIcon, UsersIcon, ShoppingBagIcon, SparklesIcon, EyeIcon,
  ReceiptIcon, GiftIcon, PlusIcon, BotIcon
} from './Icons';
import { AppView } from '../types';
import { useLanguage } from './LanguageContext';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  onAddClick: () => void;
  userName?: string;
  userXP?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, onChangeView, isOpen, onClose, onLogout, 
  isDarkMode, toggleDarkMode, userName, userXP = 0, onAddClick
}) => {
  const { t, language, setLanguage } = useLanguage();

  const navGroups = [
    {
      label: t('nav.group_core'),
      items: [
        { id: AppView.DASHBOARD, label: t('nav.dashboard'), icon: HomeIcon },
        { id: AppView.TRANSACTIONS, label: t('nav.transactions'), icon: ListIcon },
        { id: AppView.ACCOUNTS, label: t('nav.accounts'), icon: WalletIcon },
        { id: AppView.RECEIPTS, label: t('nav.receipts'), icon: ReceiptIcon },
      ]
    },
    {
      label: t('nav.group_planning'),
      items: [
        { id: AppView.BUDGETS, label: t('nav.budgets'), icon: PieChartIcon },
        { id: AppView.CALENDAR, label: t('nav.calendar'), icon: CalendarIcon },
        { id: AppView.SUBSCRIPTIONS, label: t('nav.subscriptions'), icon: FileTextIcon },
        { id: AppView.ZAKAT, label: t('nav.zakat'), icon: GiftIcon },
      ]
    },
    {
      label: t('nav.group_growth'),
      items: [
        { id: AppView.DEBTS, label: t('nav.debts'), icon: HandCoinsIcon },
        { id: AppView.DJAM3IA, label: t('nav.djam3ia'), icon: UsersGroupIcon },
        { id: AppView.SIMULATOR, label: t('nav.simulator'), icon: ChipIcon },
        { id: AppView.SHOP, label: t('nav.shop'), icon: ShoppingBagIcon },
      ]
    },
    {
      label: t('nav.group_admin'),
      items: [
        { id: AppView.ANALYTICS, label: t('nav.analytics'), icon: TrendingUpIcon },
        { id: AppView.FAMILY, label: t('nav.family'), icon: UsersIcon },
        { id: AppView.REWARDS, label: t('nav.rewards'), icon: SparklesIcon },
        { id: AppView.VISION, label: t('nav.vision'), icon: EyeIcon },
        { id: AppView.ASSISTANT, label: t('nav.assistant'), icon: BotIcon },
        { id: AppView.SETTINGS, label: t('nav.settings'), icon: SettingsIcon },
      ]
    }
  ];

  const NavButton: React.FC<{ item: any }> = ({ item }) => {
    const isActive = currentView === item.id;
    return (
      <button
        onClick={() => { onChangeView(item.id); onClose(); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden border
          ${isActive 
            ? 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-soft translate-x-1' 
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-100 dark:hover:border-white/5 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
      >
        <div className={`transition-colors duration-300 ${isActive ? 'text-brand-mint' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
            <item.icon className="w-5 h-5" />
        </div>
        <span className={`text-sm tracking-wide ${isActive ? 'font-black' : 'font-bold'}`}>{item.label}</span>
        
        {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-brand-mint rounded-l-full"></div>
        )}
      </button>
    );
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1999] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      {/* Sidebar Container */}
      <aside className={`fixed md:relative top-0 bottom-0 z-[2000] w-72 h-full glass border-r border-slate-200 dark:border-white/5 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} flex flex-col`}>
        
        <div className="flex flex-col h-full overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 pb-2 space-y-6">
                
                {/* Brand Logo */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onChangeView(AppView.DASHBOARD)}>
                  <div className="w-10 h-10 bg-slate-900 dark:bg-brand-mint rounded-xl flex items-center justify-center border-2 border-slate-100 dark:border-white/10 shadow-md group-hover:scale-105 transition-transform">
                      <WalletIcon className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">SpendWise</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Personal OS</span>
                  </div>
                </div>

                {/* User Profile Card - ID Style */}
                <div 
                    onClick={() => { onChangeView(AppView.SETTINGS); onClose(); }}
                    className="relative p-1 rounded-[1.6rem] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/10 dark:to-white/5 cursor-pointer group border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="bg-white dark:bg-[#151515] p-3 rounded-[1.4rem] flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-mint to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white dark:border-white/10 shadow-sm">
                        {userName ? userName[0].toUpperCase() : 'M'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center">
                            <SparklesIcon className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate">{userName || 'Guest'}</p>
                          <span className="text-[9px] font-bold text-brand-mint bg-brand-mint/10 px-1.5 py-0.5 rounded border border-brand-mint/20">PRO</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-mint to-blue-500 w-[65%] rounded-full"></div>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 text-right">{userXP} XP</p>
                    </div>
                  </div>
                </div>

                {/* Main Action Button */}
                <button 
                    onClick={() => { onAddClick(); onClose(); }}
                    className="w-full bg-slate-900 dark:bg-brand-mint text-white dark:text-slate-900 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-soft border-2 border-slate-800 dark:border-brand-mint/50 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <PlusIcon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">عملية جديدة</span>
                </button>
            </div>

            {/* Navigation List - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-6">
                {navGroups.map((group, idx) => (
                    <div key={idx}>
                        <p className="px-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-2">{group.label}</p>
                        <div className="space-y-1">
                            {group.items.map(item => <NavButton key={item.id} item={item} />)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Control Center */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-white/5 backdrop-blur-md">
                <div className="flex gap-2">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleDarkMode}
                        className="flex-1 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm group"
                        title="تبديل المظهر"
                    >
                        <div className={`w-5 h-5 rounded-full border-2 transition-colors ${isDarkMode ? 'border-brand-mint bg-brand-mint' : 'border-slate-400 bg-slate-400 group-hover:bg-slate-500'}`}></div>
                    </button>

                    {/* Language Toggle */}
                    <div className="flex-[2] h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex p-1 shadow-sm">
                        {['ar', 'fr', 'en'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang as any)}
                                className={`flex-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center
                                    ${language === lang 
                                        ? 'bg-slate-100 dark:bg-white/20 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`
                                }
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <button 
                        onClick={onLogout} 
                        className="flex-1 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm"
                        title={t('nav.logout')}
                    >
                        <LogOutIcon className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-center text-[9px] font-bold text-slate-300 dark:text-white/20 mt-3 uppercase tracking-widest">SpendWise v1.2</p>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
