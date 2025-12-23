
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { UsersIcon, TrashIcon, PlusIcon } from './Icons';
import { SharedUser } from '../types';

const SharedAccess: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState<SharedUser[]>(() => {
    const saved = localStorage.getItem('sharedUsers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'You', email: 'me@example.com', role: 'Owner', avatarColor: 'bg-emerald-500' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sharedUsers', JSON.stringify(users));
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
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-20">
      <header>
          <h1 className="text-2xl font-bold text-slate-800">{t('shared.title')}</h1>
          <p className="text-slate-500 text-sm">{t('shared.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {users.map(user => (
                        <div key={user.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.avatarColor}`}>
                                    {user.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{user.name} {user.role === 'Owner' && `(${t('shared.owner')})`}</h4>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === 'Owner' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {user.role === 'Owner' ? t('shared.owner') : t('shared.editor')}
                                </span>
                                {user.role !== 'Owner' && (
                                    <button onClick={() => handleRemove(user.id)} className="text-slate-400 hover:text-red-500 transition">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-blue-600" />
                {t('shared.invite')}
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={t('shared.invitePlaceholder')}
                    />
                </div>
                <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('shared.role')}</label>
                     <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                         <option>{t('shared.editor')}</option>
                         <option>{t('shared.viewer')}</option>
                     </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm">
                    {t('shared.invite')}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SharedAccess;
