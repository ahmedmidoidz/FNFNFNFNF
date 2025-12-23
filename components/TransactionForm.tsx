
import React, { useState, memo, useRef, useEffect } from 'react';
import { Transaction, Account, Debt } from '../types';
import { 
  XIcon, CameraIcon, SparklesIcon, CheckCircleIcon, 
  WalletIcon, ArrowUpIcon, ArrowDownIcon, HandCoinsIcon,
  BotIcon, MicIcon
} from './Icons';
import { useLanguage } from './LanguageContext';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { analyzeReceipt, parseTransactionString, parseVoiceTransaction } from '../services/geminiService';

interface TransactionFormProps {
    onAdd: (data: any) => void;
    onClose: () => void;
    accounts: Account[];
    currencySymbol: string;
}

const TransactionForm: React.FC<TransactionFormProps> = memo(({ 
    onAdd, onClose, accounts, currencySymbol 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'transfer' | 'debt'>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('General');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [magicText, setMagicText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Smart Lookup: When merchant name changes, look for historical data
  useEffect(() => {
      const history = localStorage.getItem('transactions');
      if (merchant.length > 2 && history) {
          const txns: Transaction[] = JSON.parse(history);
          const lastMatch = txns.find(t => t.merchant.toLowerCase() === merchant.toLowerCase());
          if (lastMatch) {
              setCategory(lastMatch.category);
              if (!amount) setAmount(lastMatch.amount.toString());
          }
      }
  }, [merchant]);

  const handleMagicAdd = async () => {
    if (!magicText.trim()) return;
    setIsAiLoading(true);
    try {
        const categories = Object.keys(DEFAULT_CATEGORIES);
        const results = await parseTransactionString(magicText, accounts, categories);
        if (results && results[0]) {
            applyParsedResult(results[0]);
            setMagicText('');
        }
    } catch (e) {
        alert("ما فهمتكش مليح، عاود جرب بكلمات أوضح.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const applyParsedResult = (res: any) => {
      setAmount(res.amount.toString());
      setMerchant(res.merchant || res.personName || '');
      setCategory(res.category || 'General');
      setActiveTab(res.type);
      if (res.type === 'debt') {
          setDebtType(res.debtType);
          setPersonName(res.personName || res.merchant);
      }
      if (res.accountId) setAccountId(res.accountId);
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              await processAudio(audioBlob);
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Error accessing microphone:", err);
          alert("Unable to access microphone");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const processAudio = async (blob: Blob) => {
      setIsAiLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          const categories = Object.keys(DEFAULT_CATEGORIES);
          
          try {
              const results = await parseVoiceTransaction(base64Audio, accounts, categories);
              if (results && results[0]) {
                  applyParsedResult(results[0]);
              }
          } catch (e) {
              console.error(e);
              alert("Sorry, I couldn't understand the audio.");
          } finally {
              setIsAiLoading(false);
          }
      };
  };

  const handleScan = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsAiLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const data = await analyzeReceipt(base64);
            if (data.total) setAmount(data.total.toString());
            if (data.merchant) setMerchant(data.merchant);
            setIsAiLoading(false);
        };
    };
    input.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    if (activeTab === 'debt') {
        onAdd({
            isDebt: true,
            person: personName || merchant,
            amount: parseFloat(amount),
            type: debtType,
            accountId: accountId
        });
    } else {
        onAdd({
            amount: parseFloat(amount),
            merchant: merchant || (activeTab === 'transfer' ? 'تحويل داخلي' : 'عملية غير محددة'),
            category,
            type: activeTab,
            date: new Date().toISOString().split('T')[0],
            currency: 'DZD',
            status: 'completed',
            accountId,
            toAccountId: activeTab === 'transfer' ? toAccountId : undefined
        });
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all" onClick={onClose}></div>
      
      <div className="relative glass-heavy w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Modern Header */}
        <div className="p-10 flex justify-between items-center bg-gradient-to-r from-slate-900/90 to-black/90 backdrop-blur-md text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint/20 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-5 z-10">
                <div className="w-16 h-16 bg-brand-mint/90 backdrop-blur rounded-2xl flex items-center justify-center text-black shadow-neon animate-pulse border-2 border-white/20">
                    <SparklesIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">إضافة ذكية</h2>
                    <p className="text-[10px] font-black text-brand-mint uppercase tracking-[0.4em] mt-1">Smart Core Glass v4</p>
                </div>
            </div>
            <button onClick={onClose} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10 border border-white/10 backdrop-blur-md">
                <XIcon className="w-6 h-6 text-white" />
            </button>
        </div>

        <div className="p-10 overflow-y-auto no-scrollbar space-y-12">
            
            {/* 1. Primary AI Input (Voice & Text) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">تحدث مع سكوربيون (أسرع طريقة)</h3>
                    <BotIcon className="w-4 h-4 text-brand-mint" />
                </div>
                <div className="relative group">
                    <textarea 
                        value={magicText}
                        onChange={e => setMagicText(e.target.value)}
                        placeholder="مثال: شريت قهوة بـ 350 دج من عند علي..."
                        className="w-full h-36 glass-input rounded-[2.5rem] p-8 text-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-brand-mint transition-all shadow-inner placeholder:text-slate-400/50"
                    />
                    
                    <div className="absolute bottom-6 left-6 flex gap-3">
                        {/* Voice Recording Button */}
                        <button 
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            disabled={isAiLoading}
                            className={`p-4 rounded-2xl font-black text-sm shadow-xl transition-all border-2 
                                ${isRecording 
                                    ? 'bg-red-500 text-white border-red-600 animate-pulse scale-110' 
                                    : 'glass text-slate-900 dark:text-white border-white/20 hover:border-brand-mint'}`}
                        >
                            <MicIcon className="w-6 h-6" />
                        </button>

                        <button 
                            onClick={handleMagicAdd}
                            disabled={isAiLoading || (!magicText.trim() && !isRecording)}
                            className="bg-slate-900 dark:bg-brand-mint text-white dark:text-black px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 border border-white/10"
                        >
                            {isAiLoading ? 'جاري التحليل...' : 'تطبيق الذكاء'}
                        </button>
                    </div>
                </div>
                {isRecording && (
                    <p className="text-center text-red-500 font-bold text-xs animate-pulse">جاري الاستماع... (أطلق الزر للإنهاء)</p>
                )}
            </div>

            <div className="flex items-center gap-6">
                <hr className="flex-1 border-slate-300 dark:border-white/10" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">أو التعديل اليدوي أدناه</span>
                <hr className="flex-1 border-slate-300 dark:border-white/10" />
            </div>

            {/* 2. Amount Big Input */}
            <div className="text-center space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">المبلغ المستهدف</p>
                <div className="flex items-center justify-center gap-6">
                    <span className="text-5xl font-black text-brand-mint drop-shadow-neon">{currencySymbol}</span>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className="bg-transparent border-none outline-none text-9xl font-black text-slate-900 dark:text-white w-full max-w-[400px] text-center placeholder:text-slate-300/30 dark:placeholder:text-white/10 tracking-tighter"
                    />
                </div>
            </div>

            {/* 3. High-End Tab Selection */}
            <div className="flex glass p-2.5 rounded-[2.5rem] shadow-sm">
                {[
                    { id: 'expense', label: 'مصرف', icon: ArrowDownIcon, color: 'bg-red-500' },
                    { id: 'income', label: 'مدخول', icon: ArrowUpIcon, color: 'bg-brand-mint text-black' },
                    { id: 'transfer', label: 'تحويل', icon: WalletIcon, color: 'bg-indigo-500' },
                    { id: 'debt', label: 'دين', icon: HandCoinsIcon, color: 'bg-amber-500' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-3xl transition-all ${activeTab === tab.id ? tab.color + ' shadow-2xl scale-105 z-10 ring-4 ring-white/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-current' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 4. Details and Category (Arabic) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
                        {activeTab === 'debt' ? 'اسم الشخص' : 'التفاصيل / المتجر'}
                    </label>
                    <input 
                        type="text"
                        value={activeTab === 'debt' ? personName : merchant}
                        onChange={e => activeTab === 'debt' ? setPersonName(e.target.value) : setMerchant(e.target.value)}
                        className="w-full p-8 glass-input rounded-[2rem] text-slate-900 dark:text-white font-bold outline-none focus:border-brand-mint transition-all shadow-sm text-lg"
                        placeholder="..."
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
                        الفئة المختارة (بالعربية)
                    </label>
                    <div className="relative">
                        <select 
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full p-8 glass-input rounded-[2rem] text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer focus:border-brand-mint shadow-sm text-lg"
                        >
                            {Object.keys(DEFAULT_CATEGORIES).map(cat => (
                                <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    {DEFAULT_CATEGORIES[cat].icon} {t(`categories.${cat}`)}
                                </option>
                            ))}
                        </select>
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ArrowDownIcon className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Account Selection Pills */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">سحب / إيداع من الحساب</label>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {accounts.map(acc => (
                        <button
                            key={acc.id}
                            type="button"
                            onClick={() => setAccountId(acc.id)}
                            className={`flex-shrink-0 px-10 py-5 rounded-[1.8rem] border transition-all font-black text-sm uppercase tracking-tighter ${accountId === acc.id ? 'bg-slate-950 dark:bg-brand-mint text-white dark:text-black border-transparent shadow-xl' : 'glass-input text-slate-400 hover:border-brand-mint/50'}`}
                        >
                            {acc.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Action Bar */}
            <div className="flex gap-6 pt-10">
                <button 
                    onClick={handleScan}
                    className="p-8 glass-input rounded-[2.5rem] text-slate-400 hover:text-brand-mint transition-all"
                >
                    <CameraIcon className="w-10 h-10" />
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={!amount || isAiLoading}
                    className="flex-1 py-8 bg-slate-950 dark:bg-brand-mint text-white dark:text-black rounded-[2.5rem] font-black text-3xl shadow-heavy hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 tracking-tighter"
                >
                    تأكيد العملية
                </button>
            </div>
        </div>
      </div>
    </div>
  );
});

export default TransactionForm;
