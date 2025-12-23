
import React, { memo, useState, useMemo, useEffect, useRef } from 'react';
import { Transaction, Account, AppView, Debt, Subscription, Budget, Djam3ia } from '../types';
import { 
  BotIcon, SparklesIcon, MicIcon, EyeIcon, EyeOffIcon, ArrowDownIcon, ArrowUpIcon,
  HandCoinsIcon, XIcon, SendIcon, CameraIcon, CheckCircleIcon
} from './Icons';
import { useLanguage } from './LanguageContext';
import { chatWithAssistantStream, parseVoiceTransaction, analyzeReceipt, parseTransactionString, generateDailyBriefing } from '../services/geminiService';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { DEFAULT_CATEGORIES } from '../data/categories';

interface DashboardProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  formatCurrency: (amount: number) => string;
  accounts: Account[];
  debts: Debt[]; 
  subscriptions?: Subscription[];
  budgets?: Budget[];
  djam3ias?: Djam3ia[];
  userName?: string;
  onAddTransaction: (t: any) => void;
  showNotification: (msg: string) => void;
  privacyMode?: boolean;
  togglePrivacy?: () => void;
  onChangeView: (v: AppView) => void;
  dailyBriefing?: { text: string; mood: 'happy' | 'neutral' | 'concerned' } | null;
  setDailyBriefing?: (b: any) => void;
}

const Dashboard: React.FC<DashboardProps> = memo(({ 
  transactions, totalIncome, totalExpense, totalBalance, formatCurrency, 
  accounts = [], debts = [], subscriptions = [], budgets = [], djam3ias = [], userName = "محمد", onAddTransaction, showNotification,
  privacyMode = false, togglePrivacy, onChangeView, dailyBriefing, setDailyBriefing
}) => {
  const { t } = useLanguage();
  
  // --- SCORPION AI STATE ---
  const [smartInput, setSmartInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{type: 'success' | 'info' | 'error', message: string} | null>(null);
  
  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Trigger Daily Briefing (Once per session via parent state)
  useEffect(() => {
      if (!dailyBriefing && setDailyBriefing && transactions.length > 0) {
          const fetchBriefing = async () => {
              const briefing = await generateDailyBriefing(userName, {
                  balance: totalBalance,
                  subscriptions,
                  djam3ias,
                  recentTransactions: transactions.slice(0, 5),
                  debts,
                  budgets
              });
              if (briefing) setDailyBriefing(briefing);
          };
          fetchBriefing();
      }
  }, [dailyBriefing, setDailyBriefing, totalBalance]); 

  // Success Metric: Days-to-Survive (Runway)
  const daysToSurvive = useMemo(() => {
    const last30DaysExp = transactions
        .filter(t => t.type === 'expense' && (new Date().getTime() - new Date(t.date).getTime()) < 30 * 86400000)
        .reduce((s, t) => s + t.amount, 0);
    const dailyBurn = last30DaysExp / 30;
    return dailyBurn > 0 ? Math.floor(totalBalance / dailyBurn) : '∞';
  }, [transactions, totalBalance]);

  const burnRatePercent = useMemo(() => {
    const dailyBurn = totalExpense / 30;
    const targetDaily = 5000; 
    return Math.min(Math.round((dailyBurn / targetDaily) * 100), 100);
  }, [totalExpense]);

  // Sparkline Data
  const liquidityTrend = useMemo(() => {
    const data: { day: number; value: number }[] = [];
    let current = totalBalance;
    const today = new Date();
    for(let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const daysTxns = transactions.filter(t => t.date === dateStr);
        const dailyChange = daysTxns.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
        data.unshift({ day: i, value: current });
        current -= dailyChange; 
    }
    return data;
  }, [totalBalance, transactions]);

  // --- AI LOGIC ---

  const handleProcessInput = async () => {
      if (!smartInput.trim() || isAiProcessing) return;
      setIsAiProcessing(true);
      setAiFeedback(null);

      try {
          const categories = Object.keys(DEFAULT_CATEGORIES);
          const txns = await parseTransactionString(smartInput, accounts, categories);

          if (txns && txns.length > 0) {
              txns.forEach(t => onAddTransaction(t));
              setAiFeedback({ type: 'success', message: `✅ تم تسجيل ${txns.length} عملية بنجاح!` });
              setSmartInput('');
          } else {
              const contextData = {
                  transactions: transactions.slice(0, 10),
                  accounts,
                  debts,
                  stats: { totalBalance, totalIncome, totalExpense },
                  subscriptions,
                  budgets
              };
              
              let answer = "";
              for await (const chunk of chatWithAssistantStream(smartInput, contextData)) {
                  answer += chunk;
              }
              setAiFeedback({ type: 'info', message: answer });
              setSmartInput(''); 
          }
      } catch (e) {
          setAiFeedback({ type: 'error', message: "عذراً، لم أفهم. حاول مرة أخرى." });
      } finally {
          setIsAiProcessing(false);
      }
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) audioChunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = async () => {
              setIsAiProcessing(true);
              setAiFeedback(null);
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async () => {
                  const base64Audio = (reader.result as string).split(',')[1];
                  try {
                      const results = await parseVoiceTransaction(base64Audio, accounts, Object.keys(DEFAULT_CATEGORIES));
                      if (results && results.length > 0) {
                          results.forEach(t => onAddTransaction(t));
                          setAiFeedback({ type: 'success', message: "✅ سمعتك! تم تسجيل العملية." });
                      } else {
                          setAiFeedback({ type: 'error', message: "لم أسمع أي عملية مالية واضحة." });
                      }
                  } catch (e) {
                      setAiFeedback({ type: 'error', message: "خطأ في معالجة الصوت." });
                  } finally {
                      setIsAiProcessing(false);
                  }
              };
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          showNotification("لا يمكن الوصول للميكروفون");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsAiProcessing(true);
      setAiFeedback(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
          try {
              const base64 = (reader.result as string).split(',')[1];
              const receiptData = await analyzeReceipt(base64);
              
              if (receiptData.total) {
                  onAddTransaction({
                      amount: receiptData.total,
                      merchant: receiptData.merchant || 'Unknown',
                      category: 'Shopping',
                      type: 'expense',
                      date: receiptData.date || new Date().toISOString().split('T')[0],
                      currency: 'DZD',
                      accountId: accounts[0]?.id
                  });
                  setAiFeedback({ type: 'success', message: `✅ تم قراءة الفاتورة: ${receiptData.total} دج` });
              } else {
                  setAiFeedback({ type: 'error', message: "لم أستطع قراءة المبلغ من الصورة." });
              }
          } catch(e) {
              setAiFeedback({ type: 'error', message: "خطأ في تحليل الصورة." });
          } finally {
              setIsAiProcessing(false);
          }
      };
  };

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32 md:pb-40 animate-slide-up">
      
      {/* 0. SMART DAILY BRIEFING */}
      {dailyBriefing && (
          <div className={`p-6 rounded-[2rem] border shadow-soft animate-in slide-in-from-top-4 flex items-start gap-4 relative overflow-hidden group
              ${dailyBriefing.mood === 'concerned' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 
                dailyBriefing.mood === 'happy' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' : 
                'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/10'}`}>
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5
                  ${dailyBriefing.mood === 'concerned' ? 'bg-red-500 text-white' : 
                    dailyBriefing.mood === 'happy' ? 'bg-emerald-500 text-white' : 
                    'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
                  <BotIcon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 z-10">
                  <h3 className="font-black text-slate-900 dark:text-white mb-1 uppercase tracking-widest text-[10px]">موجز سكوربيون</h3>
                  <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                      "{dailyBriefing.text}"
                  </p>
              </div>

              <button 
                onClick={() => setDailyBriefing && setDailyBriefing(null)} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                  <XIcon className="w-4 h-4 text-slate-400" />
              </button>
          </div>
      )}

      {/* 1. SCORPION AI HUB */}
      <div className="bg-white dark:bg-[#121212] rounded-[2rem] md:rounded-[2.5rem] p-1.5 shadow-soft border border-slate-200 dark:border-white/10 relative overflow-hidden">
          <div className="bg-slate-50 dark:bg-[#1A1A1A] rounded-[1.7rem] md:rounded-[2.2rem] p-5 md:p-8 flex flex-col gap-4">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-mint/20 rounded-lg flex items-center justify-center text-brand-mint border border-brand-mint/30">
                          <BotIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">AI Command Center</span>
                  </div>
                  {isAiProcessing && <span className="text-brand-mint text-[10px] font-black animate-pulse">جارِ المعالجة...</span>}
              </div>

              {/* Input Field */}
              <div className="relative group">
                  <textarea 
                      value={smartInput}
                      onChange={(e) => setSmartInput(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleProcessInput();
                          }
                      }}
                      placeholder="اكتب معاملة (مثلاً: صرفت 500 دج قهوة) أو اسألني..."
                      className="w-full bg-white dark:bg-black/20 text-slate-900 dark:text-white text-lg font-bold placeholder:text-slate-300 dark:placeholder:text-white/20 rounded-2xl p-5 outline-none border-2 border-slate-200 dark:border-white/5 focus:border-brand-mint transition-all resize-none h-24 md:h-28 shadow-inner"
                      disabled={isAiProcessing}
                  />
                  
                  {/* Floating Action Bar */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                      <button 
                          onMouseDown={startRecording}
                          onMouseUp={stopRecording}
                          onTouchStart={startRecording}
                          onTouchEnd={stopRecording}
                          className={`p-2.5 rounded-xl transition-all border ${isRecording ? 'bg-red-500 border-red-600 text-white animate-pulse' : 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-400 hover:text-brand-mint hover:border-brand-mint'}`}
                      >
                          <MicIcon className="w-5 h-5" />
                      </button>
                      <label className="p-2.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-brand-mint hover:border-brand-mint cursor-pointer transition-all">
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                          <CameraIcon className="w-5 h-5" />
                      </label>
                  </div>

                  <button 
                      onClick={handleProcessInput}
                      disabled={!smartInput.trim() || isAiProcessing}
                      className="absolute bottom-3 right-3 bg-slate-900 dark:bg-brand-mint text-white dark:text-black px-5 py-2.5 rounded-xl font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                  >
                      <span>إرسال</span>
                      <SendIcon className="w-3.5 h-3.5" />
                  </button>
              </div>

              {/* Feedback */}
              {aiFeedback && (
                  <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2
                      ${aiFeedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 text-emerald-700' : 
                        aiFeedback.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 text-red-700' : 
                        'bg-blue-50 dark:bg-blue-900/10 border-blue-100 text-blue-700'}`}>
                      {aiFeedback.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
                      <p className="text-sm font-bold">{aiFeedback.message}</p>
                  </div>
              )}
          </div>
      </div>

      {/* 2. METRICS & GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Balance Card */}
          <div className="lg:col-span-8 bg-white dark:bg-[#151515] rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-soft relative overflow-hidden flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{t('dashboard.liquidity')}</p>
                      <h1 className={`text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white flex items-baseline gap-2 ${privacyMode ? 'privacy-blur' : ''}`}>
                          {totalBalance.toLocaleString()} 
                          <span className="text-xl text-brand-mint font-bold">DZD</span>
                      </h1>
                  </div>
                  <button onClick={togglePrivacy} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                      {privacyMode ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
              </div>

              <div className="flex gap-4 mb-8">
                  <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('dashboard.inflow')}</span>
                      </div>
                      <p className={`text-lg font-black text-slate-800 dark:text-white ${privacyMode ? 'privacy-blur' : ''}`}>+{formatCurrency(totalIncome)}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('dashboard.outflow')}</span>
                      </div>
                      <p className={`text-lg font-black text-slate-800 dark:text-white ${privacyMode ? 'privacy-blur' : ''}`}>-{formatCurrency(totalExpense)}</p>
                  </div>
              </div>

              {/* Chart */}
              <div className="h-24 w-full relative opacity-50 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liquidityTrend}>
                        <defs>
                            <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8C6A4B" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#8C6A4B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8C6A4B" 
                            strokeWidth={3} 
                            fill="url(#colorLiquidity)" 
                            isAnimationActive={true}
                        />
                    </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Runway / Burn Rate Card */}
          <div className="lg:col-span-4 bg-slate-900 dark:bg-[#1A1A1A] text-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-heavy relative overflow-hidden border border-slate-800 dark:border-white/10">
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">{t('dashboard.runway')}</p>
                  <h3 className="text-6xl font-black tracking-tighter mb-2">
                      {daysToSurvive}<span className="text-xl align-top ml-1 opacity-50">أيام</span>
                  </h3>
                  <p className="text-xs font-bold opacity-70 leading-relaxed">
                      السيولة الحالية تكفيك لهذه المدة بناءً على متوسط صرفك.
                  </p>
              </div>
              
              <div className="mt-8">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black uppercase opacity-60">{t('dashboard.burnRate')}</span>
                      <span className="text-xs font-black">{burnRatePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 dark:bg-black/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${burnRatePercent > 80 ? 'bg-brand-heat' : 'bg-brand-mint'}`}
                        style={{ width: `${burnRatePercent}%` }} 
                      />
                  </div>
              </div>
              <SparklesIcon className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 dark:text-black/5 rotate-12" />
          </div>
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div className="grid grid-cols-3 gap-4">
          {[
              { icon: ArrowDownIcon, label: t('dashboard.add_expense'), action: () => onAddTransaction({ type: 'expense' }), color: 'text-brand-heat', bg: 'bg-brand-heat/10' },
              { icon: ArrowUpIcon, label: t('dashboard.add_income'), action: () => onAddTransaction({ type: 'income' }), color: 'text-brand-mint', bg: 'bg-brand-mint/10' },
              { icon: HandCoinsIcon, label: t('dashboard.pay_debt'), action: () => onChangeView(AppView.DEBTS), color: 'text-blue-500', bg: 'bg-blue-500/10' },
          ].map((btn, idx) => (
              <button 
                key={idx}
                onClick={btn.action}
                className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-sm group hover:border-slate-300 dark:hover:border-white/20"
              >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${btn.bg} ${btn.color} border border-current/20`}>
                      <btn.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{btn.label}</span>
              </button>
          ))}
      </div>

      {/* 4. ACTIVITY STREAM */}
      <div className="bg-white/50 dark:bg-[#151515]/50 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-brand-mint" />
                  {t('dashboard.stream')}
              </h3>
              <button 
                onClick={() => onChangeView(AppView.TRANSACTIONS)} 
                className="text-[10px] font-black bg-white dark:bg-white/10 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest"
              >
                عرض الكل
              </button>
          </div>
          
          <div className="space-y-3">
              {transactions.slice(0, 5).map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-slate-300 dark:hover:border-white/20 transition-all group">
                      <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-black/5 ${txn.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                              {txn.type === 'income' ? '💰' : '🛒'}
                          </div>
                          <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{txn.merchant}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t(`categories.${txn.category}`)}</p>
                          </div>
                      </div>
                      <p className={`text-sm font-black whitespace-nowrap ${txn.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'} ${privacyMode ? 'privacy-blur' : ''}`}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
});

export default Dashboard;
