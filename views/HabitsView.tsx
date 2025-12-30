
import React, { useState } from 'react';
import { useApp } from '../App';
import { Habit } from '../types';

const HabitsView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    frequency: 'Daily' as 'Daily' | 'Weekly',
    points: 1,
    limitPerWeek: 3
  });

  const handleCreateHabit = () => {
    if (!newHabit.title.trim()) return;
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title: newHabit.title,
      streak: 0,
      lastCompleted: null,
      pointsPerDay: Math.min(newHabit.points, 2),
      frequency: newHabit.frequency,
      limitPerWeek: newHabit.frequency === 'Weekly' ? newHabit.limitPerWeek : undefined,
      completionsThisWeek: 0
    };
    dispatch.addHabit(habit);
    setNewHabit({ title: '', frequency: 'Daily', points: 1, limitPerWeek: 3 });
    setIsModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Habits</h1>
          <p className="text-[#161617]/50 text-sm">Consistent action builds points and focus.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-11 sm:h-9 bg-[#161617] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all active:scale-95 shadow-sm"
        >
          + New Habit
        </button>
      </header>

      {state.habits.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#EDECE9] rounded-2xl bg-white/50">
          <p className="text-[#161617]/40 text-sm font-medium">No habits yet. Define your morning routines or focus habits.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {state.habits.map(habit => {
            const isCompletedToday = habit.lastCompleted === todayStr;
            const isLimitReached = habit.frequency === 'Weekly' && habit.limitPerWeek && (habit.completionsThisWeek || 0) >= habit.limitPerWeek;
            const disabled = isCompletedToday || isLimitReached;

            return (
              <div key={habit.id} className="bg-white border border-[#EDECE9] p-5 md:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F7F6F3] border border-[#EDECE9] rounded-xl flex items-center justify-center text-xl shadow-inner">
                    {habit.streak > 7 ? '🔥' : '🌱'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{habit.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#161617]/40 mt-1">
                      <span className="text-[#2383E2]">{habit.streak} DAY STREAK</span>
                      <span>•</span>
                      <span>{habit.frequency}</span>
                      {habit.frequency === 'Weekly' && (
                         <>
                           <span>•</span>
                           <span>{habit.completionsThisWeek}/{habit.limitPerWeek} THIS WEEK</span>
                         </>
                      )}
                      <span>•</span>
                      <span className="text-green-600">+{habit.pointsPerDay} PTS</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => dispatch.completeHabit(habit.id)}
                  disabled={disabled}
                  className={`h-12 sm:h-10 px-6 rounded-xl font-bold text-xs transition-all min-w-[140px] shadow-sm flex items-center justify-center ${
                    disabled 
                    ? 'bg-green-50 text-green-500 border border-green-200 opacity-80 cursor-default' 
                    : 'bg-[#161617] text-white hover:bg-black active:scale-95'
                  }`}
                >
                  {isCompletedToday ? '✓ Completed Today' : isLimitReached ? 'Limit Reached' : 'Complete'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Create Custom Habit</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#161617]/40 uppercase tracking-widest block mb-1">Habit Name</label>
                  <input 
                    autoFocus
                    value={newHabit.title}
                    onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                    placeholder="E.g. Meditation"
                    className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-3 rounded-xl outline-none focus:border-[#2383E2] text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#161617]/40 uppercase tracking-widest block mb-1">Frequency</label>
                    <select 
                      value={newHabit.frequency}
                      onChange={e => setNewHabit({...newHabit, frequency: e.target.value as any})}
                      className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-3 rounded-xl text-sm outline-none"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#161617]/40 uppercase tracking-widest block mb-1">Points (1-2)</label>
                    <input 
                      type="number" min="1" max="2"
                      value={newHabit.points}
                      onChange={e => setNewHabit({...newHabit, points: parseInt(e.target.value)})}
                      className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-3 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>

                {newHabit.frequency === 'Weekly' && (
                  <div>
                    <label className="text-[10px] font-bold text-[#161617]/40 uppercase tracking-widest block mb-1">Weekly Limit</label>
                    <input 
                      type="number" min="1" max="7"
                      value={newHabit.limitPerWeek}
                      onChange={e => setNewHabit({...newHabit, limitPerWeek: parseInt(e.target.value)})}
                      className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-3 rounded-xl text-sm outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-[#F1F0EC] py-3 rounded-xl text-xs font-bold h-11">Cancel</button>
                <button 
                  onClick={handleCreateHabit}
                  disabled={!newHabit.title.trim()}
                  className="flex-1 bg-[#161617] text-white py-3 rounded-xl text-xs font-bold h-11"
                >Create Habit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsView;
