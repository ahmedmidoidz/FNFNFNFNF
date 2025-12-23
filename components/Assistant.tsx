
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, BotIcon, MicIcon, XIcon, SparklesIcon } from './Icons';
import { ChatMessage, Transaction, Account, Debt } from '../types';
import { chatWithAssistantStream, generateSpeech } from '../services/geminiService';
import { useLanguage } from './LanguageContext';

interface AssistantProps {
  data: {
    transactions: Transaction[];
    accounts: Account[];
    debts: Debt[];
  };
}

const Assistant: React.FC<AssistantProps> = ({ data }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: '1', role: 'model', text: "أهلاً بك! أنا سكوربيون مساعدك المالي. كيف يمكنني مساعدتك اليوم؟" }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setLoading(true);

    try {
      const botMsgId = (Date.now() + 1).toString();
      const initialBotMsg: ChatMessage = { id: botMsgId, role: 'model', text: '', isThinking: true };
      setMessages(prev => [...prev, initialBotMsg]);

      let fullText = "";
      for await (const chunk of chatWithAssistantStream(userMsg.text, data)) {
          fullText += chunk;
          setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText, isThinking: false } : msg));
      }
    } catch (error) {
        setMessages(prev => [...prev, { id: 'err', role: 'model', text: "حدث خطأ في الاتصال. حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#050810] overflow-hidden p-6 md:p-12 max-w-5xl mx-auto">
      
      {/* Assistant Header Card */}
      <div className="bg-white dark:bg-[#0C121D] rounded-[2.5rem] border-2 border-slate-200 dark:border-white/5 p-6 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-mint rounded-[1.2rem] flex items-center justify-center text-black shadow-neon">
                <BotIcon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="font-black text-slate-900 dark:text-white text-xl">مساعد SpendWise الذكي</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    متصل بكل معاملاتك
                </p>
            </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pb-32 pr-2" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-6 rounded-[2.2rem] text-sm font-bold shadow-sm border-2
                ${msg.role === 'user' 
                    ? 'bg-slate-900 text-white border-slate-800 rounded-br-none' 
                    : 'bg-white dark:bg-[#0C121D] text-slate-800 dark:text-white border-slate-200 dark:border-white/5 rounded-bl-none'}`}>
              {msg.isThinking ? (
                  <div className="flex gap-1.5 py-2">
                    <div className="w-2 h-2 bg-brand-mint rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-mint rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-brand-mint rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
              ) : <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Input Section Card */}
      <div className="bg-white dark:bg-[#0C121D] rounded-[3rem] border-2 border-slate-200 dark:border-white/5 p-4 shadow-2xl flex items-center gap-3">
          <button className={`p-4 rounded-2xl transition-all border-2 ${isListening ? 'bg-red-500 border-red-600 text-white animate-pulse' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'}`}>
            <MicIcon className="w-6 h-6" />
          </button>
          <input
            className="flex-1 bg-transparent text-slate-900 dark:text-white px-4 py-4 outline-none font-bold placeholder:text-slate-300"
            placeholder="اسألني أي شيء عن مصاريفك..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={loading || !input.trim()} 
            className="bg-brand-mint text-black p-5 rounded-[1.5rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
          >
            <SendIcon className="w-6 h-6" />
          </button>
      </div>
    </div>
  );
};

export default Assistant;
