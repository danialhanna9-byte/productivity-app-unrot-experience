
import React, { useState } from 'react';
import { useApp } from '../App';

const RewardsView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handlePurchase = (reward: any) => {
    const success = dispatch.spendPoints(reward.cost, `Reward: ${reward.title}`);
    if (success) {
      setMsg({ text: `Successfully unlocked ${reward.title}! Enjoy.`, type: 'success' });
    } else {
      setMsg({ text: `Not enough points. Keep being productive!`, type: 'error' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rewards</h1>
          <p className="text-[#161617]/50">Spend your hard-earned points on real-world fun.</p>
        </div>
        <div className="bg-white border border-[#E8E7E3] px-6 py-3 rounded-xl shadow-sm">
           <div className="text-[10px] text-[#161617]/40 font-bold uppercase tracking-widest mb-1">Available Credits</div>
           <div className="text-2xl font-black text-[#161617] flex items-center gap-2">
             {state.points} <span className="text-xl">✨</span>
           </div>
        </div>
      </header>

      {msg && (
        <div className={`p-4 rounded-lg border text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.rewards.map(reward => (
          <div key={reward.id} className="bg-white border border-[#E8E7E3] p-6 rounded-xl hover:shadow-md transition-shadow group">
            <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">{reward.icon}</div>
            <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
            <p className="text-sm text-[#161617]/50 mb-6 h-10 overflow-hidden line-clamp-2">{reward.description}</p>
            
            <button 
              onClick={() => handlePurchase(reward)}
              className="w-full bg-[#F7F6F3] border border-[#E8E7E3] py-2 rounded-lg font-bold text-sm text-[#161617] hover:bg-[#161617] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{reward.cost}</span>
              <span className="text-[10px] opacity-70">POINTS</span>
            </button>
          </div>
        ))}

        <div className="border-2 border-dashed border-[#E8E7E3] p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white transition-colors group">
          <div className="w-10 h-10 bg-[#E8E7E3] rounded-full flex items-center justify-center text-[#161617]/40 group-hover:scale-110 transition-transform mb-3">+</div>
          <span className="text-sm font-semibold text-[#161617]/40 group-hover:text-[#161617]/60">Custom Reward</span>
        </div>
      </div>
    </div>
  );
};

export default RewardsView;
