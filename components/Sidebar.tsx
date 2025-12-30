
import React, { useState } from 'react';
import { useApp } from '../App';
import { Note } from '../types';

interface SidebarProps {
  activeView: string;
  selectedNoteId: string | null;
  onViewChange: (view: any) => void;
  notes: Note[];
  onNoteSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, selectedNoteId, onViewChange, notes, onNoteSelect }) => {
  const { state, dispatch } = useApp();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showReferral, setShowReferral] = useState(false);
  const [refCode, setRefCode] = useState('');

  const handleAddPage = (parentId: string | null = null, title: string = 'New Page') => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      icon: '📄',
      parentId,
      createdAt: new Date().toISOString(),
      blocks: [{ id: 'b1', type: 'text' as any, content: '' }]
    };
    dispatch.addNote(newNote);
    onNoteSelect(newNote.id);
  };

  const NavItem = ({ label, icon, id }: { label: string, icon: string, id: string }) => (
    <button
      onClick={() => onViewChange(id)}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
        activeView === id ? 'bg-[#EDECE9] text-[#37352F] font-bold shadow-sm' : 'text-[#37352F]/70 hover:bg-[#EDECE9]/40'
      }`}
    >
      <span className="w-5 flex justify-center text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  // Fix: Explicitly type NoteItem as a functional component to handle the 'key' prop correctly in TSX
  const NoteItem: React.FC<{ note: Note; level?: number }> = ({ note, level = 0 }) => {
    const children = notes.filter(n => n.parentId === note.id);
    const isExpanded = expanded[note.id];
    const isSelected = activeView === 'notes' && selectedNoteId === note.id;

    return (
      <div className="flex flex-col">
        <div 
          className={`group flex items-center px-3 py-1 rounded-md text-[13px] cursor-pointer transition-colors ${
            isSelected ? 'bg-[#EDECE9] font-bold text-[#37352F]' : 'text-[#37352F]/70 hover:bg-[#EDECE9]/30'
          }`}
          style={{ paddingLeft: `${level * 14 + 12}px` }}
          onClick={() => onNoteSelect(note.id)}
        >
          <button 
            className={`mr-1 p-0.5 rounded-sm hover:bg-black/10 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            onClick={(e) => { e.stopPropagation(); setExpanded(prev => ({ ...prev, [note.id]: !prev[note.id] })); }}
          >
            {children.length > 0 ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="opacity-40"><path d="M8 5v14l11-7z"/></svg>
            ) : <div className="w-[10px]"></div>}
          </button>
          <span className="mr-2 shrink-0">{note.icon}</span>
          <span className="truncate flex-1 py-1">{note.title || 'Untitled'}</span>
          <button 
            className="opacity-0 group-hover:opacity-100 hover:text-black transition-opacity text-base font-normal px-1"
            onClick={(e) => { e.stopPropagation(); handleAddPage(note.id); setExpanded(prev => ({ ...prev, [note.id]: true })); }}
          >+</button>
        </div>
        {isExpanded && children.map(child => <NoteItem key={child.id} note={child} level={level + 1} />)}
      </div>
    );
  };

  const rootNotes = notes.filter(n => !n.parentId);

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#EDECE9] flex flex-col h-full select-none shadow-sm z-30">
      <div className="p-4 flex items-center gap-3 border-b border-[#F7F6F3]">
        <div className="w-6 h-6 bg-[#37352F] rounded flex items-center justify-center text-white text-[10px] font-bold">UW</div>
        <span className="font-black text-sm tracking-tight text-[#37352F]">Unrot v4</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="space-y-0.5 mb-8">
          <NavItem id="dashboard" label="Dashboard" icon="📊" />
          <NavItem id="schedule" label="Planner" icon="🗓️" />
          <NavItem id="tasks" label="My Tasks" icon="✅" />
          <NavItem id="habits" label="Habits" icon="🌱" />
          <NavItem id="rewards" label="Store" icon="💎" />
        </div>
        
        <div className="mt-8">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-[#37352F]/30 uppercase tracking-[0.15em]">Workspace Pages</span>
            <button onClick={() => handleAddPage(null)} className="text-[#37352F]/40 hover:text-[#37352F] p-1">+</button>
          </div>
          <div className="space-y-0.5">
            {rootNotes.map(note => <NoteItem key={note.id} note={note} />)}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[#F7F6F3] bg-[#F7F6F3]/20 space-y-2">
        {!state.referralUsed && (
          <button onClick={() => setShowReferral(true)} className="w-full bg-[#2383E2]/10 text-[#2383E2] py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-[#2383E2]/20">Use Referral (50 pts)</button>
        )}
        <button className="flex items-center gap-3 text-xs font-semibold text-[#37352F]/40 hover:text-[#37352F] w-full px-3 py-2 rounded-lg transition-colors">
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>

      {showReferral && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl space-y-6">
            <h2 className="text-xl font-black">Referral Onboarding</h2>
            <p className="text-sm opacity-50">Enter a code to start with 50 credits.</p>
            <input value={refCode} onChange={e => setRefCode(e.target.value)} placeholder="UNROT-2024" className="w-full bg-[#F7F6F3] p-4 rounded-xl border border-[#EDECE9] font-bold outline-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowReferral(false)} className="flex-1 h-12 bg-[#F1F0EC] rounded-xl font-bold">Cancel</button>
              <button onClick={() => { dispatch.applyReferral(refCode); setShowReferral(false); }} className="flex-1 h-12 bg-[#2383E2] text-white rounded-xl font-bold shadow-lg">Claim</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
