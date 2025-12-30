
import React, { useState } from 'react';
import { useApp } from '../App';
import { TaskStatus, Priority, Task } from '../types';

const TasksView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Work',
    priority: Priority.MEDIUM,
    points: 3
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    dispatch.addTask({
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: '',
      priority: newTask.priority,
      status: TaskStatus.TODO,
      difficulty: 1,
      // Requirement: Cap at 5 points
      points: Math.max(1, Math.min(newTask.points, 5)),
      dueDate: new Date().toISOString(),
      category: newTask.category,
      tags: [newTask.category]
    });
    setNewTask({ title: '', category: 'Work', priority: Priority.MEDIUM, points: 3 });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm opacity-50">Manage workspace priorities.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="h-10 bg-[#161617] text-white px-5 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md active:scale-95"
        >
          + New Task
        </button>
      </div>

      <div className="bg-white border border-[#EDECE9] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#F7F6F3] text-[10px] font-black uppercase tracking-[0.15em] opacity-40 border-b border-[#EDECE9]">
            <tr>
              <th className="px-6 py-4">Task</th>
              <th className="px-6 py-4 text-center">Points</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDECE9]/50">
            {state.tasks.map(task => (
              <tr key={task.id} className="group hover:bg-[#F7F6F3]/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold opacity-80">{task.title}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">{task.category}</div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="bg-blue-50 text-[#2383E2] px-2 py-1 rounded-md font-bold text-xs">{task.points} ✨</span>
                </td>
                <td className="px-6 py-5">
                  {task.status !== TaskStatus.DONE && (
                    <button 
                      onClick={() => dispatch.completeTask(task.id)} 
                      className="bg-[#161617] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {state.tasks.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center opacity-30 italic text-xs">Your task list is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-150 border border-[#EDECE9]">
            <h2 className="text-2xl font-black">New Task</h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-2">Name</label>
                <input autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-2xl outline-none font-bold" placeholder="E.g. Database Cleanup" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-2">Category</label>
                  <select 
                    value={newTask.category} 
                    onChange={e => setNewTask({...newTask, category: e.target.value})}
                    className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-2xl outline-none text-sm font-bold"
                  >
                    {state.customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-2">Priority</label>
                  <select 
                    value={newTask.priority} 
                    onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-2xl outline-none text-sm font-bold"
                  >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-2">Points Awarded (1-5)</label>
                <div className="flex items-center gap-6 bg-[#F7F6F3] p-4 rounded-2xl border border-[#EDECE9]">
                  <input type="range" min="1" max="5" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})} className="flex-1 accent-[#2383E2]" />
                  <span className="font-black text-[#2383E2] w-10 text-xl">{newTask.points}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 h-14 bg-[#F1F0EC] rounded-2xl font-black text-sm opacity-60">Cancel</button>
              <button onClick={handleCreateTask} disabled={!newTask.title.trim()} className="flex-1 h-14 bg-[#2383E2] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
