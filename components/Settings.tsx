
import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { TrashIcon, PlusIcon, DownloadIcon, UploadIcon, CheckCircleIcon, SparklesIcon, EyeIcon, EyeOffIcon, SettingsIcon, ChipIcon } from './Icons';
import { AppSettings, ThemeColor } from '../types';

interface SettingsProps {
    onClearData: () => void;
    customCategories: string[];
    onAddCategory: (cat: string) => void;
    onRemoveCategory: (cat: string) => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    onImportData: (json: string) => void;
    settings: AppSettings;
    onUpdateSettings: (s: Partial<AppSettings>) => void;
}

const WALLPAPER_PRESETS = [
    { id: 'mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop', name: 'Mountains' },
    { id: 'abstract', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop', name: 'Neon' },
    { id: 'nature', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop', name: 'Forest' },
    { id: 'desert', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop', name: 'Desert' },
    { id: 'minimal', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=600&auto=format&fit=crop', name: 'Minimal' }
];

const Settings: React.FC<SettingsProps> = ({ 
    onClearData, 
    customCategories, 
    onAddCategory, 
    onRemoveCategory, 
    darkMode, 
    toggleDarkMode, 
    onImportData,
    settings,
    onUpdateSettings
}) => {
    const { t, language, setLanguage } = useLanguage();
    const [newCategory, setNewCategory] = useState('');
    const [pinInput, setPinInput] = useState('');
    const [showPin, setShowPin] = useState(false);
    
    const themeColors: {id: ThemeColor, hex: string, name: string}[] = [
        { id: 'bronze', hex: '#8C6A4B', name: 'Bronze' },
        { id: 'blue', hex: '#3b82f6', name: 'Ocean' },
        { id: 'emerald', hex: '#10b981', name: 'Emerald' },
        { id: 'violet', hex: '#8b5cf6', name: 'Royal' },
        { id: 'rose', hex: '#f43f5e', name: 'Rose' },
        { id: 'amber', hex: '#f59e0b', name: 'Amber' },
        { id: 'cyan', hex: '#06b6d4', name: 'Cyan' },
    ];

    const handleClear = () => {
        if (window.confirm(t('settings.clearDataDesc'))) {
            onClearData();
        }
    };

    const handleAddCat = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const handleExport = () => {
        const data = {
            transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
            budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
            accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
            savingsGoals: JSON.parse(localStorage.getItem('savingsGoals') || '[]'),
            customCategories: JSON.parse(localStorage.getItem('customCategories') || '[]'),
            debts: JSON.parse(localStorage.getItem('debts') || '[]')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `spendwise_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                if (json) onImportData(json);
            } catch (err) { alert('Error parsing JSON file'); }
        };
        reader.readAsText(file);
    };

    const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                    else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                    canvas.width = width; canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    onUpdateSettings({ backgroundImage: dataUrl });
                };
                if (readerEvent.target?.result) img.src = readerEvent.target.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-4 md:p-12 space-y-12 pb-40 max-w-5xl mx-auto animate-slide-up">
             <header className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-[1.5rem] flex items-center justify-center text-white dark:text-slate-900 shadow-2xl border-2 border-white/10">
                    <SettingsIcon className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t('settings.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm tracking-wide">{t('settings.subtitle')}</p>
                </div>
            </header>

            {/* 1. VISUAL CUSTOMIZATION ISLAND */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">المظهر</h3>
                <div className="bg-white dark:bg-[#151515] rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-soft space-y-8">
                    
                    {/* Theme Color */}
                    <div>
                         <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-6">لون التطبيق</h4>
                         <div className="flex flex-wrap gap-4">
                             {themeColors.map(c => (
                                 <button
                                     type="button"
                                     key={c.id}
                                     onClick={() => onUpdateSettings({ themeColor: c.id, customThemeHex: c.hex })}
                                     className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${settings.themeColor === c.id ? 'border-slate-900 dark:border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                     style={{ backgroundColor: c.hex }}
                                 >
                                     {settings.themeColor === c.id && <CheckCircleIcon className="w-6 h-6 text-white drop-shadow-md" />}
                                 </button>
                             ))}
                             
                             <div className="relative group">
                                <label className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 border-2 ${settings.themeColor === 'custom' ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}>
                                    <input 
                                        type="color" 
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        value={settings.customThemeHex || '#8C6A4B'}
                                        onChange={(e) => onUpdateSettings({ themeColor: 'custom', customThemeHex: e.target.value })}
                                    />
                                    <PlusIcon className="w-6 h-6 text-white" />
                                </label>
                             </div>
                         </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5"></div>

                    {/* Background */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">الخلفية</h4>
                            {settings.backgroundImage && (
                                <button onClick={() => onUpdateSettings({ backgroundImage: undefined })} className="text-[10px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg transition">حذف الخلفية</button>
                            )}
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-6">
                             <label className="aspect-square rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-mint transition group">
                                <UploadIcon className="w-6 h-6 text-slate-400 group-hover:text-brand-mint transition-colors" />
                                <input type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
                            </label>
                            {WALLPAPER_PRESETS.map(preset => (
                                <button
                                    type="button"
                                    key={preset.id}
                                    onClick={() => onUpdateSettings({ backgroundImage: preset.url })}
                                    className={`relative aspect-square rounded-2xl overflow-hidden shadow-sm group transition-transform hover:scale-[1.02] border-2 ${settings.backgroundImage === preset.url ? 'border-brand-mint' : 'border-transparent'}`}
                                >
                                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {settings.backgroundImage && (
                            <div>
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    <span>ضبابية الخلفية (Blur)</span>
                                    <span>{settings.wallpaperBlur || 0}px</span>
                                </div>
                                <input 
                                    type="range" min="0" max="30" 
                                    value={settings.wallpaperBlur || 0} 
                                    onChange={(e) => onUpdateSettings({ wallpaperBlur: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-mint"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 2. REGIONAL & LANGUAGE ISLAND */}
            <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">اللغة والعملة</h3>
                <div className="bg-white dark:bg-[#151515] rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-soft">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">اللغة</label>
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl">
                                {['ar', 'fr', 'en'].map(lang => (
                                    <button
                                        type="button"
                                        key={lang}
                                        onClick={() => setLanguage(lang as any)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${language === lang ? 'bg-white dark:bg-brand-mint text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                                    >
                                        {lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">رمز العملة</label>
                            <input 
                                type="text" 
                                value={settings.currencySymbol}
                                onChange={(e) => onUpdateSettings({ currencySymbol: e.target.value })}
                                className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-slate-900 dark:text-white text-center outline-none focus:border-brand-mint transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </section>

             {/* 3. DATA & SECURITY ISLAND */}
             <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">البيانات والأمان</h3>
                <div className="bg-white dark:bg-[#151515] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-soft p-8 space-y-6">
                    
                    {/* Security PIN */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-start">
                            <span className="font-bold text-slate-900 dark:text-white block text-lg">قفل التطبيق (PIN)</span>
                            <span className="text-xs font-bold text-slate-400 mt-1 block">{settings.securityPin ? 'محمي (****)' : 'غير مفعل'}</span>
                        </div>
                        <div className="flex gap-3">
                             <input 
                                type={showPin ? "text" : "password"}
                                maxLength={4}
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="جديد"
                                className="w-24 px-4 py-3 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-xl text-center font-bold tracking-widest text-slate-900 dark:text-white focus:border-brand-mint outline-none"
                             />
                             <button 
                                type="button"
                                onClick={() => {
                                    if(pinInput.length === 4) {
                                        onUpdateSettings({ securityPin: pinInput });
                                        setPinInput('');
                                        alert("تم تحديث رمز القفل!");
                                    }
                                }}
                                disabled={pinInput.length !== 4}
                                className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-black hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                             >
                                 تحديث
                             </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button type="button" onClick={handleExport} className="flex items-center justify-center gap-3 p-5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition group">
                            <DownloadIcon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('settings.export')}</span>
                        </button>
                        
                        <label className="flex items-center justify-center gap-3 p-5 border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer group">
                            <UploadIcon className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('settings.import')}</span>
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">فئات مخصصة</h4>
                        <div className="space-y-4">
                            <form onSubmit={handleAddCat} className="flex gap-3">
                                <input 
                                    type="text" 
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder={t('settings.categoryName')}
                                    className="flex-1 px-5 py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-brand-mint bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold"
                                />
                                <button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-black px-5 py-3 rounded-2xl hover:scale-105 transition shadow-sm">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="flex flex-wrap gap-2">
                                {customCategories.length === 0 && <span className="text-xs text-slate-400 italic font-bold">لا توجد فئات مخصصة</span>}
                                {customCategories.map(cat => (
                                    <div key={cat} className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/5">
                                        <span>{cat}</span>
                                        <button type="button" onClick={() => onRemoveCategory(cat)} className="text-slate-400 hover:text-red-500 transition">
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             <section>
                 <button 
                    type="button"
                    onClick={handleClear}
                    className="w-full flex items-center justify-center gap-3 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-6 rounded-[2.5rem] hover:bg-red-100 dark:hover:bg-red-900/20 transition font-black text-sm uppercase tracking-widest shadow-sm hover:shadow-md"
                >
                    <TrashIcon className="w-5 h-5" />
                    {t('settings.clearData')}
                </button>
            </section>
        </div>
    );
};

export default Settings;
