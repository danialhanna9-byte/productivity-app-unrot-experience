
import React, { useState, useEffect, createContext, useContext } from 'react';
import { AppState, Task, Habit, Reward, Note, TaskStatus, PointTransaction, AIScheduleItem, ChatMessage } from './types';
import { INITIAL_DATA } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import TasksView from './views/TasksView';
import HabitsView from './views/HabitsView';
import RewardsView from './views/RewardsView';
import NotesView from './views/NotesView';
import CalendarView from './views/CalendarView';
import Mascot from './components/Mascot';
import { chatWithAssistant } from './services/geminiService';

interface AppContextType {
  state: AppState;
  dispatch: {
    addPoints: (amount: number, reason: string) => void;
    spendPoints: (amount: number, reason: string) => boolean;
    completeTask: (taskId: string) => void;
    completeHabit: (habitId: string) => void;
    addNote: (note: Note) => void;
    updateNote: (note: Note) => void;
    deleteNote: (id: string) => void;
    addTask: (task: Task) => void;
    addHabit: (habit: Habit) => void;
    addReward: (reward: Reward) => void;
    rescheduleTask: (taskId: string, date: string, startTime: string) => void;
    adoptSchedule: (items: AIScheduleItem[]) => void;
    addCategory: (cat: string) => void;
    sendChatMessage: (content: string) => Promise<void>;
    toggleAssistant: () => void;
  };
  ui: {
    isAssistantOpen: boolean;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('unrot_workspace_v3');
    if (saved) return JSON.parse(saved);
    return { ...INITIAL_DATA, chatHistory: [], customCategories: ['Work', 'Health', 'Design', 'Finance', 'Personal'] };
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'habits' | 'rewards' | 'notes' | 'schedule'>('dashboard');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('unrot_workspace_v3', JSON.stringify(state));
  }, [state]);

  const addTransaction = (amount: number, type: 'earned' | 'spent', reason: string): PointTransaction => ({
    id: Math.random().toString(36).substr(2, 9),
    amount,
    type,
    reason,
    date: new Date().toISOString()
  });

  const dispatch = {
    addPoints: (amount: number, reason: string) => {
      setState(prev => ({
        ...prev,
        points: prev.points + amount,
        pointHistory: [addTransaction(amount, 'earned', reason), ...prev.pointHistory]
      }));
    },
    spendPoints: (amount: number, reason: string) => {
      if (state.points >= amount) {
        setState(prev => ({
          ...prev,
          points: prev.points - amount,
          pointHistory: [addTransaction(amount, 'spent', reason), ...prev.pointHistory]
        }));
        return true;
      }
      return false;
    },
    completeTask: (taskId: string) => {
      setState(prev => {
        const task = prev.tasks.find(t => t.id === taskId);
        if (!task || task.status === TaskStatus.DONE) return prev;
        const cappedPoints = Math.min(task.points, 5);
        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.DONE } : t),
          points: prev.points + cappedPoints,
          pointHistory: [addTransaction(cappedPoints, 'earned', `Task: ${task.title}`), ...prev.pointHistory]
        };
      });
    },
    completeHabit: (habitId: string) => {
      const today = new Date().toISOString().split('T')[0];
      setState(prev => {
        const habit = prev.habits.find(h => h.id === habitId);
        if (!habit || (habit.frequency === 'Daily' && habit.lastCompleted === today)) return prev;
        const cappedPoints = Math.min(habit.pointsPerDay, 2);
        return {
          ...prev,
          habits: prev.habits.map(h => h.id === habitId ? { ...h, streak: h.streak + 1, lastCompleted: today } : h),
          points: prev.points + cappedPoints,
          pointHistory: [addTransaction(cappedPoints, 'earned', `Habit: ${habit.title}`), ...prev.pointHistory]
        };
      });
    },
    addNote: (note: Note) => setState(prev => ({ ...prev, notes: [...prev.notes, note] })),
    updateNote: (note: Note) => setState(prev => ({ ...prev, notes: prev.notes.map(n => n.id === note.id ? note : n) })),
    deleteNote: (id: string) => setState(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) })),
    addTask: (task: Task) => setState(prev => ({ ...prev, tasks: [...prev.tasks, task] })),
    addHabit: (habit: Habit) => setState(prev => ({ ...prev, habits: [...prev.habits, habit] })),
    addReward: (reward: Reward) => setState(prev => ({ ...prev, rewards: [...prev.rewards, reward] })),
    rescheduleTask: (taskId: string, date: string, startTime: string) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, dueDate: date, startTime } : t)
      }));
    },
    adoptSchedule: (items: AIScheduleItem[]) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => {
          const match = items.find(item => item.taskId === t.id);
          return match ? { ...t, startTime: match.startTime } : t;
        })
      }));
    },
    addCategory: (cat: string) => {
      setState(prev => prev.customCategories.includes(cat) ? prev : { ...prev, customCategories: [...prev.customCategories, cat] });
    },
    toggleAssistant: () => setIsAssistantOpen(prev => !prev),
    sendChatMessage: async (content: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, timestamp: new Date().toISOString() };
      setState(prev => ({ ...prev, chatHistory: [...(prev.chatHistory || []), userMsg] }));
      
      const responseText = await chatWithAssistant(content, state.chatHistory || []);
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, timestamp: new Date().toISOString() };
      setState(prev => ({ ...prev, chatHistory: [...(prev.chatHistory || []), assistantMsg] }));
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, ui: { isAssistantOpen } }}>
      <div className="flex h-screen overflow-hidden text-[#161617] bg-[#F7F6F3]">
        {/* Assistant Chat Sidebar (Left) */}
        <div className={`fixed left-0 top-0 bottom-0 z-[60] w-80 bg-white border-r border-[#EDECE9] shadow-2xl transition-transform duration-300 ease-in-out ${isAssistantOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <header className="h-12 border-b border-[#EDECE9] flex items-center justify-between px-4 bg-[#F7F6F3]/50">
               <span className="text-xs font-bold tracking-tight opacity-40 uppercase">Assistant Chat</span>
               <button onClick={dispatch.toggleAssistant} className="hover:bg-black/5 p-1 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {(state.chatHistory || []).map(msg => (
                 <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#2383E2] text-white' : 'bg-[#F7F6F3] text-[#161617] border border-[#EDECE9]'}`}>
                      {msg.content}
                   </div>
                   <span className="text-[10px] opacity-20 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
               ))}
               {(state.chatHistory || []).length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                   <div className="text-2xl opacity-20">✨</div>
                   <p className="text-xs opacity-30 font-medium">I'm your productivity partner. Ask me to plan your day, draft notes, or suggest habits.</p>
                 </div>
               )}
            </div>
            <div className="p-4 border-t border-[#EDECE9]">
               <input 
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                     dispatch.sendChatMessage(e.currentTarget.value);
                     e.currentTarget.value = '';
                   }
                 }}
                 placeholder="Ask Assistant..." 
                 className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-3 rounded-xl text-sm outline-none focus:border-[#2383E2] transition-colors"
               />
            </div>
          </div>
        </div>

        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform fixed md:relative z-40 h-full`}>
          <Sidebar 
            activeView={activeView} 
            onViewChange={(v) => { setActiveView(v); setSelectedNoteId(null); setIsSidebarOpen(false); }} 
            notes={state.notes}
            onNoteSelect={(id) => { setActiveView('notes'); setSelectedNoteId(id); setIsSidebarOpen(false); }}
          />
        </div>
        
        {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          <header className="h-12 border-b border-[#EDECE9] bg-[#F7F6F3]/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 justify-between select-none">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[#161617]/50 hover:text-[#161617]">☰</button>
              <div className="flex items-center gap-2 text-sm text-[#161617]/50 font-medium overflow-hidden">
                <span className="truncate">Unrot Workspace</span>
                <span>/</span>
                <span className="text-[#161617] capitalize">{activeView === 'tasks' ? 'Tasks' : activeView === 'schedule' ? 'Calendar' : activeView}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#EDECE9]/50 px-3 py-1 rounded text-xs font-bold text-[#161617] whitespace-nowrap border border-[#EDECE9]">
                {state.points} ✨
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'tasks' && <TasksView />}
            {activeView === 'habits' && <HabitsView />}
            {activeView === 'rewards' && <RewardsView />}
            {activeView === 'schedule' && <CalendarView />}
            {activeView === 'notes' && <NotesView selectedId={selectedNoteId} onSelect={setSelectedNoteId} />}
          </div>

          <Mascot />
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
