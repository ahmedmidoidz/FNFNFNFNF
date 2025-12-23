import React from 'react';
import { AppView } from '../types';
import { HomeIcon, ListIcon, PlusIcon, CalendarIcon, WalletIcon } from './Icons';

interface MobileNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onAddClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onChangeView, onAddClick }) => {
  const NavItem = ({ view, icon: Icon, activeColor = 'text-brand-mint' }: { view: AppView, icon: any, activeColor?: string }) => (
    <button 
      onClick={() => onChangeView(view)} 
      className={`relative p-3 rounded-2xl transition-all duration-300 ${currentView === view ? 'bg-white/10 text-white scale-110' : 'text-slate-400 hover:text-white'}`}
    >
      <Icon className="w-6 h-6" />
      {currentView === view && (
        <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${activeColor.replace('text-', 'bg-')}`}></span>
      )}
    </button>
  );

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-[50]">
      {/* The Floating Dock */}
      <div className="bg-[#0f172a]/90 dark:bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl flex justify-between items-center px-6 py-4 relative">
        
        <NavItem view={AppView.DASHBOARD} icon={HomeIcon} />
        <NavItem view={AppView.TRANSACTIONS} icon={ListIcon} />

        {/* Central Floating Action Button (Integrated) */}
        <div className="relative -top-8">
            <button 
                onClick={onAddClick}
                className="w-16 h-16 bg-brand-mint text-brand-obsidian rounded-[1.8rem] flex items-center justify-center shadow-neon border-[6px] border-[#F8FAFC] dark:border-[#020617] transform transition-transform active:scale-95 hover:scale-105 hover:-translate-y-1"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>

        <NavItem view={AppView.CALENDAR} icon={CalendarIcon} />
        <NavItem view={AppView.ACCOUNTS} icon={WalletIcon} />
      </div>
    </div>
  );
};

export default MobileNav;