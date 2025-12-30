
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

  const handleOptimizeRequest = async (useTemplate: boolean = false) => {
    setLoading(true);
    if (useTemplate) {
      const template = state.templates[0]; // Standard Workday
      const planned = template.items.map(item => ({
        taskId: 'temp-' + Math.random(), // Simulated task creation for template
        startTime: item.startTime,
        title: item.title
      }));
      // Simulation of template application
      alert("Applying template: " + template.name);
      setLoading(false);
      setShowAiPrompt(false);
      return;
    }

    const pendingTasks = state.tasks.filter(t => t.status !== TaskStatus.DONE);
    try {
      const plan = await suggestStructuredSchedule(pendingTasks, contextInput || 'normal day');
      const validPlan = plan.filter((p: any) => state.tasks.some(t => t.id === p.taskId));
      setProposedPlan(validPlan);
    } catch (e) {
      console.error("AI Planner Error", e);
    } finally {
      setLoading(false);
      setShowAiPrompt(false);
    }
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
      category: 'Personal'
    });
    setIsQuickAddOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-40">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Daily Calendar</h1>
          <p className="text-[#37352F]/40 text-sm">Click any slot to block time.</p>
        </div>
        <button 
          onClick={() => setShowAiPrompt(true)} 
          disabled={loading} 
          className="h-10 bg-[#2383E2] text-white px-6 rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          {loading ? 'Processing...' : '✨ AI Scheduler'}
        </button>
      </header>

      <div className="flex-1 bg-white border border-[#EDECE9] rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
        <div className="grid grid-cols-[80px_1fr] divide-x divide-[#EDECE9] h-full overflow-y-auto">
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const tasksAtThisTime = state.tasks.filter(t => t.startTime === timeStr && t.status !== TaskStatus.DONE);
            return (
              <React.Fragment key={hour}>
                <div className="p-6 text-right text-[10px] font-black text-[#37352F]/20 uppercase select-none border-b border-[#F7F6F3]">{hour}:00</div>
                <div 
                  className="p-3 border-b border-[#F7F6F3] flex flex-col gap-2 group transition-colors hover:bg-[#F7F6F3]/40 cursor-pointer min-h-[100px]"
                  onClick={() => handleSlotClick(timeStr)}
                >
                   {tasksAtThisTime.map(task => (
                     <div key={task.id} onClick={(e) => e.stopPropagation()} className="p-4 rounded-2xl border border-[#EDECE9] bg-white shadow-xl border-l-4 border-l-[#2383E2] text-xs font-bold animate-in slide-in-from-left-2">
                       {task.title}
                     </div>
                   ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {showAiPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-3xl p-10 space-y-8 shadow-2xl animate-in zoom-in-95 border border-[#EDECE9]">
              <h3 className="text-2xl font-black">Plan Your Day</h3>
              <p className="text-sm text-[#37352F]/50 leading-relaxed">Choose between applying a template or letting AI plan a custom day based on context.</p>
              
              <div className="space-y-3">
                 <button onClick={() => handleOptimizeRequest(true)} className="w-full h-14 bg-[#161617] text-white rounded-2xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-all">Apply Monday Template</button>
                 <div className="flex items-center gap-4 text-[10px] font-black opacity-20 uppercase tracking-widest"><div className="h-px flex-1 bg-current"></div>OR<div className="h-px flex-1 bg-current"></div></div>
                 <textarea value={contextInput} onChange={e => setContextInput(e.target.value)} placeholder="e.g. Focus on deep work today" className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-5 rounded-2xl outline-none text-sm h-32 resize-none" />
                 <button onClick={() => handleOptimizeRequest(false)} className="w-full h-14 bg-[#2383E2] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all">AI Custom Plan</button>
              </div>
              <button onClick={() => setShowAiPrompt(false)} className="w-full text-center text-xs font-bold opacity-30 hover:opacity-100 transition-opacity">Dismiss</button>
           </div>
        </div>
      )}

      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-xs rounded-2xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-lg font-bold">Schedule Slot ({quickAddTask.startTime})</h3>
              <input autoFocus value={quickAddTask.title} onChange={e => setQuickAddTask({...quickAddTask, title: e.target.value})} placeholder="What's happening?" className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-xl outline-none text-sm font-bold" onKeyDown={(e) => e.key === 'Enter' && submitQuickTask()} />
              <div className="flex gap-2">
                 <button onClick={() => setIsQuickAddOpen(false)} className="flex-1 h-12 bg-[#F1F0EC] rounded-xl font-bold text-xs">Cancel</button>
                 <button onClick={submitQuickTask} className="flex-1 h-12 bg-[#161617] text-white rounded-xl font-bold text-xs">Add</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
