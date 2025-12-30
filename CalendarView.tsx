
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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTask, setQuickAddTask] = useState({ title: '', startTime: '' });

  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  const handleOptimizeRequest = async () => {
    setLoading(true);
    // AI needs pending tasks
    const pendingTasks = state.tasks.filter(t => t.status !== TaskStatus.DONE);
    
    try {
      const plan = await suggestStructuredSchedule(pendingTasks, contextInput || 'normal day');
      // Verify IDs exist in our local state before allowing adoption
      const validPlan = plan.filter((p: any) => state.tasks.some(t => t.id === p.taskId));
      setProposedPlan(validPlan);
    } catch (e) {
      console.error("Failed to parse AI plan", e);
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
    <div className="space-y-6 h-full flex flex-col pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Calendar</h1>
          <p className="text-[#37352F]/40 text-sm">Tap any slot to manually block time.</p>
        </div>
        <button 
          onClick={() => setShowAiPrompt(true)} 
          disabled={loading} 
          className="h-9 bg-[#2383E2] text-white px-5 rounded-lg text-xs font-bold transition-all shadow-md hover:brightness-110 active:scale-95 flex items-center gap-2"
        >
          ✨ {loading ? 'Planning...' : 'AI Planner'}
        </button>
      </header>

      {proposedPlan.length > 0 && (
        <div className="bg-[#FFFFFF] border-2 border-[#2383E2]/20 p-6 rounded-2xl shadow-xl animate-in slide-in-from-top-4 duration-300">
           <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 bg-[#2383E2] rounded-full animate-pulse"></div>
             <div className="text-[10px] font-black text-[#2383E2] uppercase tracking-[0.2em]">AI Workflow Plan</div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
             {proposedPlan.map((p, i) => {
               const task = state.tasks.find(t => t.id === p.taskId);
               if (!task) return null;
               return (
                 <div key={i} className="flex items-center gap-3 p-3 bg-[#F7F6F3] rounded-xl border border-[#EDECE9]/50">
                   <div className="text-[10px] font-black opacity-30 w-10">{p.startTime}</div>
                   <div className="text-xs font-bold truncate">{task.title}</div>
                 </div>
               );
             })}
           </div>
           <div className="flex gap-3">
             <button onClick={adoptPlan} className="bg-[#161617] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all">Adopt Plan</button>
             <button onClick={() => setProposedPlan([])} className="bg-[#F7F6F3] text-[#37352F]/50 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#EDECE9] transition-all">Dismiss</button>
           </div>
        </div>
      )}

      {proposedPlan.length === 0 && !loading && contextInput && (
        <div className="text-center py-2 text-xs opacity-40 font-bold">Enter intent to generate plan above</div>
      )}

      <div className="flex-1 bg-white border border-[#EDECE9] rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="grid grid-cols-[80px_1fr] divide-x divide-[#EDECE9] h-full overflow-y-auto">
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const tasksAtThisTime = state.tasks.filter(t => t.startTime === timeStr && t.status !== TaskStatus.DONE);
            return (
              <React.Fragment key={hour}>
                <div className="p-4 text-right text-[10px] font-black text-[#37352F]/20 uppercase h-24 border-t first:border-t-0 border-[#EDECE9] select-none">{hour}:00</div>
                <div 
                  className="p-3 border-t first:border-t-0 border-[#EDECE9] flex flex-col gap-2 group transition-colors hover:bg-[#F7F6F3]/40 cursor-pointer relative"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) handleSlotClick(timeStr);
                  }}
                >
                   {tasksAtThisTime.map(task => (
                     <div 
                        key={task.id} 
                        className="p-4 rounded-xl border-l-4 border-[#2383E2] bg-white shadow-[0_4px_12px_rgba(35,131,226,0.12)] border border-[#2383E2]/10 text-xs font-bold flex justify-between items-center group/task animate-in slide-in-from-left-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                       <div className="flex flex-col gap-0.5">
                         <span className="opacity-80">{task.title}</span>
                         <span className="text-[9px] uppercase opacity-40 font-black tracking-widest">{task.category}</span>
                       </div>
                       <button onClick={() => dispatch.completeTask(task.id)} className="opacity-0 group-hover/task:opacity-100 bg-[#2383E2] text-white px-3 py-1.5 rounded-lg text-[10px] transition-all hover:scale-105 active:scale-95">Complete</button>
                     </div>
                   ))}
                   {tasksAtThisTime.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       <span className="text-[10px] font-black text-[#2383E2] uppercase tracking-[0.2em]">+ Add Slot</span>
                     </div>
                   )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {showAiPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-2xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <h3 className="text-xl font-bold">Plan Your Day</h3>
              <p className="text-xs text-[#37352F]/50 leading-relaxed">Describe your energy or goals (e.g., "normal day", "busy morning"). AI will arrange your tasks.</p>
              <textarea 
                autoFocus
                value={contextInput} 
                onChange={e => setContextInput(e.target.value)} 
                placeholder="normal day" 
                className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-xl outline-none text-sm h-32 resize-none focus:border-[#2383E2] transition-colors font-medium" 
              />
              <div className="flex gap-3">
                 <button onClick={() => setShowAiPrompt(false)} className="flex-1 h-12 bg-[#F7F6F3] border border-[#EDECE9] rounded-xl font-bold text-sm opacity-60">Cancel</button>
                 <button onClick={handleOptimizeRequest} className="flex-1 h-12 bg-[#2383E2] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">Generate Plan</button>
              </div>
           </div>
        </div>
      )}

      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-150">
           <div className="bg-white w-full max-w-xs rounded-2xl p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Schedule Slot</h3>
                <span className="text-[10px] font-black text-[#2383E2] bg-blue-50 px-2 py-1 rounded-md">{quickAddTask.startTime}</span>
              </div>
              <input 
                autoFocus 
                value={quickAddTask.title} 
                onChange={e => setQuickAddTask({...quickAddTask, title: e.target.value})} 
                placeholder="What are you doing?" 
                className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-xl outline-none text-sm font-medium focus:border-[#2383E2]"
                onKeyDown={(e) => e.key === 'Enter' && submitQuickTask()}
              />
              <div className="flex gap-2">
                 <button onClick={() => setIsQuickAddOpen(false)} className="flex-1 h-11 bg-[#F7F6F3] rounded-xl font-bold text-xs opacity-50">Cancel</button>
                 <button onClick={submitQuickTask} className="flex-1 h-11 bg-[#161617] text-white rounded-xl font-bold text-xs">Add Event</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
