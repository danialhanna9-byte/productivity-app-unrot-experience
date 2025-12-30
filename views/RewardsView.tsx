
import React, { useState } from 'react';
import { useApp } from '../App';
import { Reward } from '../types';

const RewardsView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    cost: 50,
    icon: '🎮'
  });

  const ICONS = [
    { label: 'Gaming', icon: '🎮' },
    { label: 'Food', icon: '🍕' },
    { label: 'Drink', icon: '☕' },
    { label: 'Sleep', icon: '🛌' },
    { label: 'Entertainment', icon: '🍿' },
    { label: 'Shopping', icon: '🛍️' },
    { label: 'Travel', icon: '🏖️' },
  ];

  const handleCreate = () => {
    if (!newReward.title.trim()) return;
    dispatch.addReward({
      id: Math.random().toString(36).substr(2, 9),
      title: newReward.title,
      cost: Math.max(newReward.cost, 50),
      description: 'Custom reward.',
      icon: newReward.icon
    });
    setNewReward({ title: '', cost: 50, icon: '🎮' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rewards</h1>
          <p className="text-[#161617]/50 text-sm">Invest focus credits into real-world pleasure.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="h-9 bg-[#161617] text-white px-5 rounded-lg text-xs font-bold">+ New Reward</button>
      </header>

      {msg && <div className={`p-4 rounded-xl border text-xs font-bold ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg.text}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.rewards.map(reward => (
          <div key={reward.id} className="bg-white border border-[#EDECE9] p-6 rounded-2xl flex flex-col hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-6">{reward.icon}</div>
            <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
            <button onClick={() => {
              if(dispatch.spendPoints(reward.cost, `Unlock: ${reward.title}`)) setMsg({ text: 'Unlocked!', type: 'success' });
              else setMsg({ text: 'Need more credits.', type: 'error' });
              setTimeout(() => setMsg(null), 3000);
            }} className="mt-auto w-full bg-[#F7F6F3] border border-[#EDECE9] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#161617] hover:text-white transition-all h-12">
              Unlock for {reward.cost} ✨
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold">New Reward</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#161617]/40 uppercase tracking-widest block mb-1">Title</label>
                {/* Fixed: Changed setNewTask to setNewReward */}
                <input value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})} className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-3 rounded-xl outline-none" placeholder="Reward name..." />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#161617]/40 uppercase tracking-widest block mb-1">Icon Selection</label>
                <div className="grid grid-cols-4 gap-2">
                   {ICONS.map(i => (
                     <button key={i.icon} onClick={() => setNewReward({...newReward, icon: i.icon})} className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${newReward.icon === i.icon ? 'border-[#2383E2] bg-[#EBF5FB]' : 'border-[#EDECE9] hover:bg-[#F7F6F3]'}`}>
                        <span className="text-xl">{i.icon}</span>
                        <span className="text-[8px] font-bold uppercase truncate w-full text-center">{i.label}</span>
                     </button>
                   ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#161617]/40 uppercase tracking-widest block mb-1">Cost (Min 50)</label>
                <input type="number" min="50" value={newReward.cost} onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value)})} className="w-full bg-[#F7F6F3] border border-[#EDECE9] p-3 rounded-xl font-bold" />
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 h-11 bg-[#F1F0EC] rounded-xl font-bold">Cancel</button>
               <button onClick={handleCreate} className="flex-1 h-11 bg-[#161617] text-white rounded-xl font-bold">Add Reward</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsView;