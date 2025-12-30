
import React, { useState } from 'react';
import { useApp } from '../App';
import { TaskStatus, Priority, Task } from '../types';

const TasksView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customCat, setCustomCat] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Work',
    priority: Priority.MEDIUM,
    points: 1
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
      points: Math.min(newTask.points, 5),
      dueDate: new Date().toISOString(),
      tags: [newTask.category],
      category: newTask.category
    });
    setNewTask({ title: '', category: 'Work', priority: Priority.MEDIUM, points: 1 });
    setIsModalOpen(false);
    setIsAddingCustom(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm opacity-50">Manage your workspace priorities.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="h-9 bg-[#161617] text-white px-4 rounded-lg text-xs font-bold hover:bg-black transition-all">+ New Task</button>
      </div>

      {state.tasks.length === 0 ? (
        <div className="py-24 border border-dashed border-[#EDECE9] rounded-2xl flex flex-col items-center justify-center bg-white/50">
          <p className="text-sm opacity-30">No tasks in your database.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#EDECE9] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F7F6F3] text-[10px] font-black uppercase tracking-[0.1em] opacity-40 border-b border-[#EDECE9]">
              <tr>
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDECE9]/50">
              {state.tasks.map(task => (
                <tr key={task.id} className="group hover:bg-[#F7F6F3]/30 transition-colors">
                  <td className="px-6 py-5 font-medium opacity-80">{task.title}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] bg-[#EDECE9] px-2 py-1 rounded font-bold opacity-60 uppercase">{task.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    {task.status !== TaskStatus.DONE && (
                      <button onClick={() => dispatch.completeTask(task.id)} className="text-[#2383E2] font-bold text-xs hover:underline">Complete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold">New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-1">Title</label>
                <input autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-xl outline-none font-medium" placeholder="Task name..." />
              </div>
              
              <div>
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-1">Category</label>
                <div className="flex gap-2">
                  <select 
                    value={isAddingCustom ? 'custom' : newTask.category} 
                    onChange={e => {
                      if (e.target.value === 'custom') setIsAddingCustom(true);
                      else {
                        setIsAddingCustom(false);
                        setNewTask({...newTask, category: e.target.value});
                      }
                    }}
                    className="flex-1 bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-xl outline-none text-sm font-medium"
                  >
                    {state.customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="custom">+ Add custom...</option>
                  </select>
                  {isAddingCustom && (
                    <div className="flex gap-1">
                      <input 
                        value={customCat} 
                        onChange={e => setCustomCat(e.target.value)} 
                        className="bg-[#F7F6F3] border border-[#EDECE9] p-4 rounded-xl outline-none text-sm w-32" 
                        placeholder="New category" 
                      />
                      <button 
                        onClick={() => {
                          if (customCat.trim()) {
                            dispatch.addCategory(customCat.trim());
                            setNewTask({...newTask, category: customCat.trim()});
                            setIsAddingCustom(false);
                            setCustomCat('');
                          }
                        }}
                        className="bg-[#161617] text-white px-4 rounded-xl font-bold text-xs"
                      >Add</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest block mb-1">Points (1-5)</label>
                <div className="flex items-center gap-4 bg-[#F7F6F3] p-4 rounded-xl border border-[#EDECE9]">
                  <input type="range" min="1" max="5" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})} className="flex-1 accent-[#2383E2]" />
                  <span className="font-bold text-[#2383E2] w-6 text-center">{newTask.points}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 h-12 bg-[#F1F0EC] rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={handleCreateTask} disabled={!newTask.title.trim()} className="flex-1 h-12 bg-[#161617] text-white rounded-xl font-bold text-sm disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
