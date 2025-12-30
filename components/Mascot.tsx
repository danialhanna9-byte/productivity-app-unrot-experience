
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { getMascotAdvice } from '../services/geminiService';

const Mascot: React.FC = () => {
  const { state, dispatch } = useApp();
  const [advice, setAdvice] = useState("Checking your workspace...");
  const [isVisible, setIsVisible] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setIsThinking(true);
      const msg = await getMascotAdvice(
        state.points,
        state.tasks.filter(t => t.status !== 'Done').length,
        state.habits.length
      );
      setAdvice(msg);
      setIsThinking(false);
    };

    const timer = setTimeout(() => {
      setIsVisible(true);
      fetchAdvice();
    }, 1500);

    return () => clearTimeout(timer);
  }, [state.points, state.tasks.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="group relative">
        <div className="absolute bottom-full right-0 mb-6 w-72 p-4 bg-white border border-[#EDECE9] rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[10px] font-bold text-[#2383E2] uppercase tracking-widest">Assistant</div>
            {isThinking && <div className="flex gap-1"><div className="w-1 h-1 bg-[#2383E2] rounded-full animate-bounce"></div><div className="w-1 h-1 bg-[#2383E2] rounded-full animate-bounce [animation-delay:0.2s]"></div></div>}
          </div>
          <p className="text-sm text-[#161617]/90 leading-relaxed font-medium">
            "{advice}"
          </p>
          <div className="mt-3 pt-3 border-t border-[#EDECE9] text-[10px] text-[#161617]/40 italic">
            Click to open Assistant Chat
          </div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-[#EDECE9] rotate-45"></div>
        </div>
        
        <button 
          onClick={dispatch.toggleAssistant}
          className="w-14 h-14 bg-white border border-[#EDECE9] rounded-2xl flex items-center justify-center shadow-lg hover:border-[#2383E2] hover:shadow-xl transition-all active:scale-95 group overflow-hidden"
        >
          <div className="relative">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`text-[#2383E2] ${isThinking ? 'animate-pulse' : ''}`}>
               <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
               <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
             </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Mascot;
