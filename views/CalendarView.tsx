
import React, { useState } from 'react';
import { useApp } from '../App';
import { suggestStructuredSchedule } from '../services/geminiService';
import { Priority, TaskStatus } from '../types';

const CalendarView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [proposedPlan, setProposedPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [contextInput, setContextInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTask, setQuickAddTask] = useState({ title: '', startTime: '' });

  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  const handleOptimizeRequest = async () => {
    setLoading(true);
    setErrorMsg(null);
    const pendingTasks = state.tasks.filter(t => t.status !== TaskStatus.DONE);
    
    if (pendingTasks.length === 0) {
      setErrorMsg("No pending tasks to plan. Create some first!");
      setLoading(false);
      return;
    }

    try {
      const plan = await suggestStructuredSchedule(pendingTasks, contextInput || 'normal day');
      const validPlan = plan.filter((p: any) => state.tasks.some(t => t.id === p.taskId));
      
      if (validPlan.length === 0) {
        setErrorMsg("AI couldn't map tasks to slots. Try being more specific!");
      } else {
        setProposedPlan(validPlan);
      }
    } catch (e) {
      console.error("Critical AI Plan Error", e);
      setErrorMsg("Failed to connect to AI Planner. Check your API key or connection.");
    } finally {
      setLoading(false);
      setShowAiPrompt(false);
    }
  };

  const adoptPlan = () => {
    dispatch.adoptSchedule(proposedPlan);
    setProposedPlan([]);
    setContextInput('');
  };

  const handleSlotClick = (startTime: string) => {
    setQuickAddTask({ title: '', startTime });
    setIsQuickAddOpen(true);
  };

  const submitQuickTask = () => {
    if (!quickAddTask.title.trim()) return;
    dispatch.addTask({
      id: Math.random().toString(36).substr(2, 9),
      title: quickAddTask.title,
      description: '',
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      difficulty: 1,
      points: 1,
      dueDate: new Date().toISOString(),
      startTime: quickAddTask.startTime,
      tags: ['Calendar'],
      category: 'Personal'
    });
    setIsQuickAddOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-40">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Calendar</h1>
          <p className="text-[#37352F]/40 text-sm">Tap any slot to manually block time.</p>
        </div>
        <button 
          onClick={() => setShowAiPrompt(true)} 
          disabled={loading} 
          className="h-10 bg-[#2383E2] text-white px-6 rounded-xl text-xs font-bold transition-all shadow-md hover:brightness-110 active:scale-95 flex items-center gap-2"
        >
          {loading ? (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          ) : '✨ AI Planner'}
        </button>
      </header>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
          ⚠️ {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-4 underline opacity-50">Dismiss</button>
        </div>
      )}

      {proposedPlan.length > 0 && (
        <div className="bg-[#FFFFFF] border-2 border-[#2383E2]/20 p-8 rounded-2xl shadow-2xl animate-in slide-in-from-top-6 duration-300">
           <div className="flex items-center gap-2 mb-6">
             <div className="w-2.5 h-2.5 bg-[#2383E2] rounded-full animate-pulse"></div>
             <div className="text-[10px] font-black text-[#2383E2] uppercase tracking-[0.2em]">New Workflow Suggestion</div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
             {proposedPlan.map((p, i) => {
               const task = state.tasks.find(t => t.id === p.taskId);
               if (!task) return null;
               return (
                 <div key={i} className="flex items-center gap-4 p-4 bg-[#F7F6F3] rounded-xl border border-[#EDECE9]/50 shadow-sm">
                   <div className="text-[11px] font-black opacity-30 w-12">{p.startTime}</div>
                   <div className="text-sm font-bold truncate opacity-80">{task.title}</div>
                 </div>
               );
             })}
           </div>
           <div className="flex gap-4">
             <button onClick={adoptPlan} className="bg-[#161617] text-white px-8 py-3 rounded-xl text-xs font-bold hover:shadow-xl transition-all">Adopt AI Plan</button>
             <button onClick={() => setProposedPlan([])} className="bg-[#F7F6F3] text-[#37352F]/40 px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#EDECE9] transition-all">Dismiss</button>
           </div>
        </div>
      )}

      <div className="flex-1 bg-white border border-[#EDECE9] rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
        <div className="grid grid-cols-[80px_1fr] divide-x divide-[#EDECE9] h-full overflow-y-auto">
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const tasksAtThisTime = state.tasks.filter(t => t.startTime === timeStr && t.status !== TaskStatus.DONE);
            return (
              <React.Fragment key={hour}>
                <div className="p-4 text-right text-[10px] font-black text-[#37352F]/20 uppercase h-24 border-t first:border-t-0 border-[#EDECE9] select-none bg-[#F7F6F3]/10">{hour}:00</div>
                <div 
                  className="p-3 border-t first:border-t-0 border-[#EDECE9] flex flex-col gap-2 group transition-colors hover:bg-[#F7F6F3]/40 cursor-pointer relative"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) handleSlotClick(timeStr);
                  }}
                >
                   {tasksAtThisTime.map(task => (
                     <div 
                        key={task.id} 
                        className="p-5 rounded-xl border-l-4 border-[#2383E2] bg-white shadow-xl border border-[#EDECE9] text-xs font-bold flex justify-between items-center group/task animate-in slide-in-from-left-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                       <div className="flex flex-col gap-1">
                         <span className="opacity-90 text-sm">{task.title}</span>
                         <span className="text-[9px] uppercase opacity-30 font-black tracking-widest">{task.category}</span>
                       </div>
                       <button onClick={() => dispatch.completeTask(task.id)} className="opacity-0 group-hover/task:opacity-100 bg-[#2383E2] text-white px-4 py-2 rounded-lg text-[10px] transition-all hover:scale-105">Complete</button>
                     </div>
                   ))}
                   {tasksAtThisTime.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       <span className="text-[10px] font-black text-[#2383E2] uppercase tracking-[0.25em]">+ Block Slot</span>
                     </div>
                   )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {showAiPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-3xl p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-black tracking-tight">Daily Context</h3>
              <p className="text-sm text-[#37352F]/60 leading-relaxed font-medium">Describe your vibe or commitments (e.g. "normal day", "busy morning", "focus only on work").</p>
              <textarea 
                autoFocus
                value={contextInput} 
                onChange={e => setContextInput(e.target.value)} 
                placeholder="e.g. normal day" 
                className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-5 rounded-2xl outline-none text-sm h-40 resize-none focus:border-[#2383E2] transition-colors font-semibold" 
              />
              <div className="flex gap-4">
                 <button onClick={() => setShowAiPrompt(false)} className="flex-1 h-14 bg-[#F7F6F3] border border-[#EDECE9] rounded-2xl font-bold text-sm opacity-60 hover:opacity-100">Cancel</button>
                 <button onClick={handleOptimizeRequest} className="flex-1 h-14 bg-[#2383E2] text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20">Analyze & Plan</button>
              </div>
           </div>
        </div>
      )}

      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-xs rounded-2xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Schedule Event</h3>
                <span className="text-[10px] font-black text-[#2383E2] bg-blue-50 px-2 py-1 rounded-md">{quickAddTask.startTime}</span>
              </div>
              <input 
                autoFocus 
                value={quickAddTask.title} 
                onChange={e => setQuickAddTask({...quickAddTask, title: e.target.value})} 
                placeholder="What are you up to?" 
                className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-xl outline-none text-sm font-semibold focus:border-[#2383E2] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && submitQuickTask()}
              />
              <div className="flex gap-2">
                 <button onClick={() => setIsQuickAddOpen(false)} className="flex-1 h-12 bg-[#F7F6F3] rounded-xl font-bold text-xs opacity-50">Cancel</button>
                 <button onClick={submitQuickTask} className="flex-1 h-12 bg-[#161617] text-white rounded-xl font-bold text-xs">Add Event</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
