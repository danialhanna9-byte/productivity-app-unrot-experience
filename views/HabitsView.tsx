
import React, { useState } from 'react';
import { useApp } from '../App';
import { Habit } from '../types';

const HabitsView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    points: 1
  });

  const handleCreateHabit = () => {
    if (!newHabit.title.trim()) return;
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title: newHabit.title,
      streak: 0,
      lastCompleted: null,
      // Requirement: Cap at 2 points
      pointsPerDay: Math.max(1, Math.min(newHabit.points, 2)),
      frequency: 'Daily'
    };
    dispatch.addHabit(habit);
    setNewHabit({ title: '', points: 1 });
    setIsModalOpen(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Habit Tracker</h1>
          <p className="text-[#161617]/50 text-sm">Consistent daily actions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-10 bg-[#161617] text-white px-6 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md active:scale-95"
        >
          + Create Habit
        </button>
      </header>

      <div className="grid gap-4">
        {state.habits.map(habit => {
          // Requirement: Anti-Spam (disabled if already completed today)
          const isCompletedToday = habit.lastCompleted === today;

          return (
            <div key={habit.id} className="bg-white border border-[#EDECE9] p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-[#2383E2] rounded-2xl flex items-center justify-center text-xl font-bold border border-blue-100 shadow-inner">
                  {habit.streak}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{habit.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">
                    <span className="text-[#2383E2]">Daily Streak</span>
                    <span>•</span>
                    <span>+{habit.pointsPerDay} Points</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => dispatch.completeHabit(habit.id)}
                disabled={isCompletedToday}
                className={`h-12 px-8 rounded-2xl font-black text-xs transition-all shadow-md ${
                  isCompletedToday 
                  ? 'bg-green-50 text-green-500 border border-green-200 cursor-default shadow-none' 
                  : 'bg-[#161617] text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isCompletedToday ? '✓ Completed' : 'Mark Done'}
              </button>
            </div>
          );
        })}
        {state.habits.length === 0 && (
          <div className="py-20 text-center opacity-30 italic text-sm">Start your first daily routine.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 border border-[#EDECE9]">
            <h2 className="text-2xl font-black">New Habit</h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-2">Habit Name</label>
                <input autoFocus value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})} placeholder="E.g. Meditation" className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-2xl outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-2">Points (1-2)</label>
                <div className="flex gap-3">
                  {[1, 2].map(p => (
                    // Fix: Changed setNewReward to setNewHabit
                    <button key={p} onClick={() => setNewHabit({...newHabit, points: p})} className={`flex-1 h-12 rounded-xl font-bold text-sm border-2 transition-all ${newHabit.points === p ? 'border-[#2383E2] bg-blue-50 text-[#2383E2]' : 'border-[#EDECE9] text-[#161617]/40 hover:bg-[#F7F6F3]'}`}>
                      {p} Pt{p > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 h-12 bg-[#F1F0EC] rounded-2xl font-bold text-xs opacity-60">Cancel</button>
              <button onClick={handleCreateHabit} disabled={!newHabit.title.trim()} className="flex-1 h-12 bg-[#2383E2] text-white rounded-2xl font-bold text-xs shadow-lg active:scale-95">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsView;
