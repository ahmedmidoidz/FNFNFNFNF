
import React, { useState, useEffect } from 'react';
import { Transaction, AppView, Account, Debt } from './types';
import TransactionForm from './components/TransactionForm';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav'; 
import Login from './components/Login';
import MainView from './components/MainView';
import Onboarding from './components/Onboarding';
import Landing from './components/Landing';
import { PlusIcon, MenuIcon, SparklesIcon, BotIcon, WalletIcon, EyeIcon, EyeOffIcon } from './components/Icons';
import { useLanguage } from './components/LanguageContext';
import { useFinanceData } from './hooks/useFinanceData';

// Robust Hex to RGB Helper
const hexToRgbArray = (hex: string): [number, number, number] => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    
    if (cleanHex.length !== 6) return [0, 0, 0];

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return [r, g, b];
}

// Helper: Mix two colors
// amount: 0..1 (0 = color1, 1 = color2)
const mixColors = (hex1: string, hex2: string, amount: number) => {
    const rgb1 = hexToRgbArray(hex1);
    const rgb2 = hexToRgbArray(hex2);
    
    const r = Math.round(rgb1[0] * (1 - amount) + rgb2[0] * amount);
    const g = Math.round(rgb1[1] * (1 - amount) + rgb2[1] * amount);
    const b = Math.round(rgb1[2] * (1 - amount) + rgb2[2] * amount);
    
    return `rgb(${r}, ${g}, ${b})`;
};

const App: React.FC = () => {
  const { language } = useLanguage();
  const financeData = useFinanceData();
  
  const [appStatus, setAppStatus] = useState<'landing' | 'onboarding' | 'login' | 'active'>('landing');
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    if (financeData.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [financeData.darkMode]);

  // --- DYNAMIC THEME ENGINE ---
  useEffect(() => {
      const root = document.documentElement;
      const settings = financeData.settings;
      const primaryHex = settings.customThemeHex || '#8C6A4B'; // Default Bronze
      
      try {
          // 1. Generate Full Color Palette (50-900)
          root.style.setProperty('--color-primary-50', mixColors(primaryHex, '#ffffff', 0.95));
          root.style.setProperty('--color-primary-100', mixColors(primaryHex, '#ffffff', 0.9));
          root.style.setProperty('--color-primary-200', mixColors(primaryHex, '#ffffff', 0.75));
          root.style.setProperty('--color-primary-300', mixColors(primaryHex, '#ffffff', 0.6));
          root.style.setProperty('--color-primary-400', mixColors(primaryHex, '#ffffff', 0.3));
          root.style.setProperty('--color-primary-500', primaryHex);
          root.style.setProperty('--color-primary-600', mixColors(primaryHex, '#000000', 0.1));
          root.style.setProperty('--color-primary-700', mixColors(primaryHex, '#000000', 0.3));
          root.style.setProperty('--color-primary-800', mixColors(primaryHex, '#000000', 0.5));
          root.style.setProperty('--color-primary-900', mixColors(primaryHex, '#000000', 0.7));
          
          root.style.setProperty('--color-primary-glow', `${primaryHex}4d`); // 30% opacity
          
          // 2. Update Glass Effects based on Card Style
          if (settings.cardStyle === 'solid') {
              root.style.setProperty('--glass-bg', financeData.darkMode ? '#1C1917' : '#FFFFFF');
              root.style.setProperty('--glass-border', 'transparent');
              root.style.setProperty('--glass-blur', '0px');
          } else if (settings.cardStyle === 'outline') {
              root.style.setProperty('--glass-bg', 'transparent');
              root.style.setProperty('--glass-border', financeData.darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');
              root.style.setProperty('--glass-blur', '0px');
          } else {
              // Default Glass
              root.style.setProperty('--glass-bg', financeData.darkMode ? 'rgba(28, 25, 23, 0.6)' : 'rgba(250, 250, 249, 0.7)');
              root.style.setProperty('--glass-border', financeData.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)');
              // Ensure we fallback to 16px if undefined, but respect 0 if set to 0.
              const blurVal = settings.backgroundBlur !== undefined ? settings.backgroundBlur : 16;
              root.style.setProperty('--glass-blur', `${blurVal}px`);
          }

          // 3. Handle Background Image
          if (settings.backgroundImage) {
              document.body.style.backgroundImage = `url(${settings.backgroundImage})`;
              document.body.style.backgroundSize = 'cover';
              document.body.style.backgroundPosition = 'center';
              document.body.style.backgroundAttachment = 'fixed';
              
              const blobs = document.querySelector('.blob-bg') as HTMLElement;
              if(blobs) blobs.style.display = 'none';
          } else {
              document.body.style.backgroundImage = '';
              const blobs = document.querySelector('.blob-bg') as HTMLElement;
              if(blobs) blobs.style.display = 'block';
          }
      } catch (e) {
          console.error("Theme Engine Error", e);
      }

  }, [
      financeData.settings.themeColor, 
      financeData.settings.customThemeHex, 
      financeData.settings.cardStyle,
      financeData.settings.backgroundImage,
      financeData.settings.backgroundBlur,
      financeData.darkMode
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-US', {
      style: 'currency',
      currency: financeData.settings.currency || 'DZD',
      maximumFractionDigits: 0
    }).format(amount).replace(financeData.settings.currency || 'DZD', financeData.settings.currencySymbol || 'د.ج');
  };

  const handleGlobalAdd = (data: any) => {
    if (data.isDebt || data.type === 'debt') {
        const newDebt: Omit<Debt, 'id'> = {
            person: data.person || data.personName || data.merchant,
            amount: data.amount,
            remainingAmount: data.amount,
            type: data.type === 'debt' ? (data.debtType || 'lent') : data.type,
            isPaid: false,
            history: []
        };
        financeData.setDebts((prev: Debt[]) => [...prev, { ...newDebt, id: Date.now().toString() }]);
        if (data.accountId) {
             financeData.setAccounts((prev: Account[]) => prev.map(acc => {
                if (acc.id === data.accountId) {
                    const diff = (data.debtType === 'borrowed' || data.type === 'borrowed') ? data.amount : -data.amount;
                    return { ...acc, balance: acc.balance + diff };
                }
                return acc;
            }));
        }
        financeData.showNotification(`تم تسجيل العملية ✅`);
    } else {
        financeData.addTransaction(data);
        financeData.showNotification("تمت إضافة العملية بنجاح! ✅");
    }
    setShowAddModal(false);
  };

  if (appStatus === 'landing') return <Landing onStartNew={() => setAppStatus('onboarding')} onStartDemo={() => { financeData.setupAdminDemo(); setAppStatus('active'); }} onLogin={() => setAppStatus('login')} isOnboarded={financeData.settings.isOnboarded} />;
  if (appStatus === 'onboarding') return <Onboarding onComplete={(s, a) => { financeData.updateSettings(s); financeData.setAccounts([a]); setAppStatus('active'); }} />;
  if (appStatus === 'login') return <Login onLogin={() => setAppStatus('active')} expectedPin={financeData.settings.securityPin || '1234'} />;

  return (
    <div className={`relative flex h-screen font-sans overflow-hidden transition-colors duration-500`}>
      
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isDarkMode={financeData.darkMode} 
        toggleDarkMode={() => financeData.setDarkMode(!financeData.darkMode)} 
        onLogout={() => setAppStatus('landing')} 
        onAddClick={() => setShowAddModal(true)}
        userName={financeData.settings.userName}
        userXP={financeData.settings.spentXP}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Glass Mobile App Bar */}
        <div className="md:hidden p-6 flex items-center justify-between glass border-b-0 border-slate-100 dark:border-white/5 z-20">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/20 dark:bg-black/20 rounded-xl text-slate-900 dark:text-white shadow-sm border border-white/20 backdrop-blur-md">
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-mint rounded-lg flex items-center justify-center shadow-neon">
                    <WalletIcon className="w-5 h-5 text-black" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">SpendWise</span>
            </div>
            <button onClick={() => setPrivacyMode(!privacyMode)} className="p-3 bg-white/20 dark:bg-black/20 rounded-xl text-brand-mint shadow-sm border border-white/20 backdrop-blur-md">
                {privacyMode ? <EyeOffIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
            <MainView 
                view={view} 
                data={{...financeData, privacyMode} as any} 
                formatCurrency={formatCurrency} 
                actions={{...financeData, setShowAddModal, togglePrivacy: () => setPrivacyMode(!privacyMode), addTransaction: handleGlobalAdd} as any} 
                onChangeView={setView}
            />
        </div>
      </main>

      <MobileNav currentView={view} onChangeView={setView} onAddClick={() => setShowAddModal(true)} />

      {showAddModal && (
        <TransactionForm onAdd={handleGlobalAdd} onClose={() => setShowAddModal(false)} accounts={financeData.accounts} currencySymbol={financeData.settings.currencySymbol} />
      )}

      {financeData.notification && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[5000] animate-in slide-in-from-top-4 duration-300">
              <div className="glass-heavy text-slate-900 dark:text-white px-10 py-5 rounded-[2.5rem] font-black text-xs shadow-2xl flex items-center gap-4">
                  <SparklesIcon className="w-4 h-4 text-brand-mint animate-pulse" />
                  {financeData.notification}
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
