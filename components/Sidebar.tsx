
import React, { useState } from 'react';
import { useApp } from '../App';
import { Note } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: any) => void;
  notes: Note[];
  onNoteSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, notes, onNoteSelect }) => {
  const { dispatch } = useApp();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);

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

  const NoteItem = ({ note, level = 0 }: { note: Note, level?: number }) => {
    const children = notes.filter(n => n.parentId === note.id);
    const isExpanded = expanded[note.id];
    const isSelected = activeView === 'notes' && note.id === notes.find(n => n.id === note.id)?.id;

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
        <span className="font-bold text-sm tracking-tight text-[#37352F]">Unrot Workspace</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="space-y-0.5 mb-8">
          <NavItem id="dashboard" label="Home" icon="📊" />
          <NavItem id="schedule" label="Calendar" icon="🗓️" />
          <NavItem id="tasks" label="Tasks" icon="✅" />
          <NavItem id="habits" label="Habit Tracker" icon="🌱" />
          <NavItem id="rewards" label="Reward Store" icon="💎" />
        </div>
        
        <div className="mt-8">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-[#37352F]/30 uppercase tracking-[0.15em]">Private Pages</span>
            <button 
              onClick={() => handleAddPage(null)} 
              className="text-[#37352F]/40 hover:text-[#37352F] transition-colors p-1"
              title="Add a page"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div className="space-y-0.5">
            {rootNotes.map(note => <NoteItem key={note.id} note={note} />)}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[#F7F6F3] bg-[#F7F6F3]/20">
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-3 text-xs font-semibold text-[#37352F]/40 hover:text-[#37352F] w-full px-3 py-2.5 rounded-lg transition-colors"
        >
          <span className="text-sm">⚙️</span>
          <span>Workspace Settings</span>
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-3xl max-w-sm w-full shadow-2xl space-y-6">
            <h2 className="text-2xl font-black">Workspace Settings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#EDECE9]">
                <span className="text-sm font-bold opacity-60">Sidebar Width</span>
                <span className="text-xs font-bold">240px</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#EDECE9]">
                <span className="text-sm font-bold opacity-60">Dark Mode</span>
                <span className="text-xs font-bold text-[#2383E2]">System Default</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#EDECE9]">
                <span className="text-sm font-bold opacity-60">Export Format</span>
                <span className="text-xs font-bold">Markdown</span>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full h-12 bg-[#161617] text-white rounded-2xl font-bold text-sm">Close</button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
