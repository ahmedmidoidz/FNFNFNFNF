
import React, { useState } from 'react';
import { Account } from '../types';
import { PlusIcon, WalletIcon, BuildingIcon, XIcon, CheckCircleIcon, GiftIcon, SendIcon } from './Icons';
import { useLanguage } from './LanguageContext';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  formatCurrency: (amount: number) => string;
}

const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount, formatCurrency }) => {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Add Account State
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('Cash');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-slate-900');

  // Transfer State
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAccount({ name, type, balance: parseFloat(balance), currency: 'DZD', color: selectedColor });
    setShowAddModal(false);
    setName(''); setBalance('');
  };

  const colors = ['bg-slate-900', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600'];

  return (
    <div className="p-4 md:p-12 space-y-10 max-w-7xl mx-auto pb-32 md:pb-40 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
              {t('accounts.title')}
              <div className="bg-brand-mint text-black px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{accounts.length} Active</div>
          </h1>
          <p className="text-slate-500 font-bold mt-2">{t('accounts.subtitle')}</p>
        </div>
        <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[1.2rem] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-xl border border-white/10"
        >
            <PlusIcon className="w-5 h-5" />
            {t('accounts.add')}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
            <div key={acc.id} className="group relative h-64 perspective">
                <div className={`absolute inset-0 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl transition-transform duration-500 hover:-translate-y-2 border border-white/10 overflow-hidden ${acc.color} dark:brightness-90`}>
                    
                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                            {acc.type === 'Bank' ? <BuildingIcon className="w-7 h-7" /> : <WalletIcon className="w-7 h-7" />}
                        </div>
                        <span className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                            {acc.type}
                        </span>
                    </div>
                    
                    <div className="relative z-10 text-white">
                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Current Balance</p>
                        <h3 className="text-4xl font-black tracking-tight">{formatCurrency(acc.balance)}</h3>
                        <p className="mt-4 font-bold text-lg opacity-90">{acc.name}</p>
                    </div>

                    {/* Decorative Circle */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
            </div>
        ))}
        
        {/* Quick Transfer Action */}
        <button 
            onClick={() => {
                if(accounts.length < 2) {
                    alert("تحتاج حسابين على الأقل للقيام بتحويل.");
                    return;
                }
                setFromAccount(accounts[0].id);
                setToAccount(accounts[1].id);
                setShowTransferModal(true);
            }}
            className="h-64 rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 hover:text-brand-royal hover:border-brand-royal/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group gap-4"
        >
            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                <SendIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em]">Quick Transfer</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowAddModal(false)}></div>
            <div className="bg-white dark:bg-[#12141C] w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-white/20 relative z-10 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">إضافة حساب</h2>
                    <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 dark:bg-white/10 rounded-full"><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">اسم الحساب</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint" placeholder="مثلاً: الخزنة" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">النوع</label>
                            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white appearance-none outline-none">
                                <option value="Cash">كاش</option>
                                <option value="CCP">CCP</option>
                                <option value="Bank">بنك</option>
                                <option value="Wallet">محفظة</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الرصيد</label>
                            <input type="number" required value={balance} onChange={e => setBalance(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint" placeholder="0" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">لون البطاقة</label>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setSelectedColor(c)}
                                    className={`w-10 h-10 rounded-full ${c} ${selectedColor === c ? 'ring-4 ring-offset-2 ring-brand-mint' : ''} transition-all shrink-0`}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-transform">حفظ</button>
                </form>
            </div>
        </div>
      )}

      {showTransferModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowTransferModal(false)}></div>
            <div className="bg-white dark:bg-[#12141C] w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-white/20 relative z-10 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">تحويل أموال</h2>
                    <button onClick={() => setShowTransferModal(false)} className="p-2 bg-slate-100 dark:bg-white/10 rounded-full"><XIcon className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="space-y-6">
                     <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-slate-200 dark:border-white/5">
                         <div className="flex-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">من</label>
                             <select value={fromAccount} onChange={e => setFromAccount(e.target.value)} className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none">
                                {accounts.map(a => <option key={a.id} value={a.id} disabled={a.id === toAccount}>{a.name}</option>)}
                             </select>
                         </div>
                         <div className="w-px h-10 bg-slate-200 dark:bg-white/10"></div>
                         <div className="flex-1 text-right">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">إلى</label>
                             <select value={toAccount} onChange={e => setToAccount(e.target.value)} className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none text-right" dir="rtl">
                                {accounts.map(a => <option key={a.id} value={a.id} disabled={a.id === fromAccount}>{a.name}</option>)}
                             </select>
                         </div>
                     </div>

                     <div className="text-center">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">المبلغ</label>
                         <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="w-full text-center text-5xl font-black bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-200" placeholder="0" />
                     </div>

                     <button 
                        onClick={() => {
                            if (!transferAmount || !fromAccount || !toAccount) return;
                            const event = new CustomEvent('spendwise-transfer', { 
                                detail: { from: fromAccount, to: toAccount, amount: parseFloat(transferAmount) } 
                            });
                            window.dispatchEvent(event);
                            setShowTransferModal(false);
                            setTransferAmount('');
                        }}
                        className="w-full py-5 bg-brand-royal text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-transform"
                    >
                        تأكيد التحويل
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
