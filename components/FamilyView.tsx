
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { UsersIcon, TrashIcon, PlusIcon, CheckCircleIcon } from './Icons';
import { SharedUser } from '../types';
import InfoTag from './InfoTag';

const FamilyView: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState<SharedUser[]>(() => {
    const saved = localStorage.getItem('familyUsers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'أنا (المسؤول)', email: 'me@spendwise.dz', role: 'Owner', avatarColor: 'bg-emerald-500' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('familyUsers', JSON.stringify(users));
  }, [users]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const newUser: SharedUser = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role: 'Editor',
      avatarColor: 'bg-blue-500'
    };
    setUsers([...users, newUser]);
    setEmail('');
    alert(t('shared.inviteSent'));
  };

  const handleRemove = (id: string) => {
    if (window.confirm("هل أنت متأكد من إزالة هذا العضو؟")) {
        setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 pb-32 max-w-7xl mx-auto animate-in fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  {t('shared.title')}
                  <InfoTag title={t('shared.title')} description={t('help.family')} />
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('shared.subtitle')}</p>
          </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Members List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-primary-500" />
                        أعضاء العائلة ({users.length})
                    </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {users.map(user => (
                        <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 transition">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md ${user.avatarColor}`}>
                                    {user.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{user.name}</h4>
                                    <p className="text-xs font-bold text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${user.role === 'Owner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {user.role === 'Owner' ? t('shared.owner') : t('shared.editor')}
                                </span>
                                {user.role !== 'Owner' && (
                                    <button onClick={() => handleRemove(user.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Invite Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-[#1A1A1A] dark:to-[#0C121D] border border-slate-800 dark:border-white/5 p-8 rounded-[2.5rem] shadow-xl text-white h-fit">
            <h3 className="font-black text-2xl mb-2 flex items-center gap-3">
                {t('shared.invite')}
                <PlusIcon className="w-6 h-6 opacity-50" />
            </h3>
            <p className="text-sm opacity-70 mb-8 font-medium">أرسل دعوة لأفراد عائلتك للانضمام إلى هذه المساحة.</p>
            
            <form onSubmit={handleInvite} className="space-y-5">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">البريد الإلكتروني</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-white/10 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold placeholder:text-white/30"
                        placeholder={t('shared.invitePlaceholder')}
                    />
                </div>
                <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{t('shared.role')}</label>
                     <select className="w-full px-5 py-4 bg-white/10 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer">
                         <option className="text-black">{t('shared.editor')}</option>
                         <option className="text-black">{t('shared.viewer')}</option>
                     </select>
                </div>
                <button type="submit" className="w-full bg-primary-500 hover:bg-primary-400 text-white py-4 rounded-2xl font-black shadow-lg transition-transform active:scale-95 mt-4">
                    {t('shared.invite')}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default FamilyView;
