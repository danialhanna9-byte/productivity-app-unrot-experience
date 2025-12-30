
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWeeklySuggestions } from '../services/geminiService';
import { PointTransaction } from '../types';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [weeklyAdvice, setWeeklyAdvice] = useState<string[]>([]);

  useEffect(() => {
    const fetchAdvice = async () => {
      const stats = {
        tasksDone: state.tasks.filter(t => t.status === 'Done').length,
        pointsEarned: state.pointHistory.filter(h => h.type === 'earned').reduce((acc, curr) => acc + curr.amount, 0),
        pointsSpent: state.pointHistory.filter(h => h.type === 'spent').reduce((acc, curr) => acc + curr.amount, 0),
        categoryBreakdown: state.tasks.reduce((acc: Record<string, number>, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {})
      };
      const res = await getWeeklySuggestions(stats);
      // Clean up bullets and whitespace
      const lines = res.split('\n')
        .map(line => line.trim().replace(/^•\s*/, ''))
        .filter(line => line.length > 0)
        .slice(0, 3);
      setWeeklyAdvice(lines);
    };
    fetchAdvice();
  }, [state.tasks, state.pointHistory]);

  const earnedData = state.pointHistory
    .filter(h => h.type === 'earned')
    .slice(0, 7)
    .reverse()
    .map((h, i) => ({ name: `Action ${i+1}`, points: h.amount }));

  const categoryData = Object.entries(state.tasks.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const COLORS_LIST = ['#2383E2', '#37352F', '#DAD9D4', '#EB5757', '#F2C94C'];

  const totalEarned = state.pointHistory.filter(h => h.type === 'earned').reduce((a, b) => a + b.amount, 0);
  const totalSpent = state.pointHistory.filter(h => h.type === 'spent').reduce((a, b) => a + b.amount, 0);
  const prodHours = state.tasks.filter(t => t.status === 'Done').reduce((a, b) => a + (b.duration || 30), 0) / 60;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Weekly Insights</h1>
        <p className="text-[#37352F]/50 text-sm">A deep dive into your productivity and reward balance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Points Earned', value: totalEarned, icon: '📈' },
          { label: 'Points Spent', value: totalSpent, icon: '💸' },
          { label: 'Prod. Hours', value: prodHours.toFixed(1), icon: '⏳' },
          { label: 'Completion', value: `${Math.round((state.tasks.filter(t => t.status === 'Done').length / (state.tasks.length || 1)) * 100)}%`, icon: '🎯' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-[#EDECE9] p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#37352F]/40 uppercase tracking-widest mb-2">
              <span>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#EDECE9] p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-sm mb-6 flex items-center justify-between">
            <span className="opacity-70">Points Velocity</span>
            <span className="text-[10px] text-[#37352F]/30 font-bold uppercase tracking-widest">Last 7 earned</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earnedData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2383E2" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2383E2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #EDECE9', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="points" stroke="#2383E2" strokeWidth={2} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#EDECE9] p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-sm mb-6 opacity-70">Categories</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_LIST[index % COLORS_LIST.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
             {categoryData.slice(0, 4).map((entry, i) => (
               <div key={i} className="flex items-center justify-between text-[11px] font-medium">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_LIST[i % COLORS_LIST.length] }}></div>
                   <span className="opacity-60">{entry.name}</span>
                 </div>
                 <span className="font-bold opacity-80">{entry.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EDECE9] p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-sm mb-4 opacity-70">AI Weekly Suggestions</h3>
          <div className="space-y-3">
            {weeklyAdvice.length > 0 ? weeklyAdvice.map((advice, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-[#F7F6F3]/50 rounded-xl border border-[#EDECE9]/30 hover:border-[#2383E2]/30 transition-colors">
                <div className="w-6 h-6 bg-blue-50 text-[#2383E2] rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</div>
                <p className="text-sm font-medium leading-relaxed opacity-80">{advice}</p>
              </div>
            )) : (
              <div className="space-y-2">
                <div className="h-10 bg-[#F7F6F3] animate-pulse rounded-lg"></div>
                <div className="h-10 bg-[#F7F6F3] animate-pulse rounded-lg"></div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#EDECE9] p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-sm mb-4 opacity-70">Recent History</h3>
          <div className="space-y-1">
            {state.pointHistory.slice(0, 6).map((tx: PointTransaction) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#EDECE9]/30 last:border-0 hover:bg-[#F7F6F3]/30 px-1 rounded transition-colors">
                <div>
                  <div className="text-xs font-semibold opacity-80">{tx.reason}</div>
                  <div className="text-[9px] text-[#37352F]/30 uppercase font-bold tracking-widest">{new Date(tx.date).toLocaleDateString()}</div>
                </div>
                <div className={`text-xs font-bold ${tx.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
            {state.pointHistory.length === 0 && (
              <p className="text-xs opacity-30 text-center py-8 italic font-medium">No history yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
