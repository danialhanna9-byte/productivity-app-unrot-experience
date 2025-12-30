
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Note, BlockType, Block, TaskStatus, Priority } from '../types';

interface NotesViewProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ selectedId, onSelect }) => {
  const { state, dispatch } = useApp();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState<{ id: string, visible: boolean, category: string }>({ id: '', visible: false, category: 'Main' });
  // Fix: Use ReturnType<typeof setTimeout> to support both Node and Browser contexts without explicit namespace
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedId) {
      const note = state.notes.find(n => n.id === selectedId);
      if (note) setActiveNote(note);
    } else if (state.notes.length > 0) {
      setActiveNote(state.notes[0]);
    }
  }, [selectedId, state.notes]);

  // Requirement: Debounced saving to prevent lag
  const debouncedSave = (note: Note) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      dispatch.updateNote(note);
    }, 800);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!activeNote) return;
    const updated = { ...activeNote, title: newTitle };
    setActiveNote(updated);
    debouncedSave(updated);
  };

  const updateBlock = (blockId: string, content: string) => {
    if (!activeNote) return;
    if (content.endsWith('/')) {
      setShowSlashMenu({ id: blockId, visible: true, category: 'Main' });
    } else {
      setShowSlashMenu({ id: '', visible: false, category: 'Main' });
    }

    const updated = { ...activeNote, blocks: activeNote.blocks.map(b => b.id === blockId ? { ...b, content } : b) };
    setActiveNote(updated);
    debouncedSave(updated);
  };

  const getBreadcrumbs = () => {
    if (!activeNote) return [];
    const crumbs = [];
    let current: Note | undefined = activeNote;
    while (current) {
      crumbs.unshift(current);
      current = state.notes.find(n => n.id === current?.parentId);
    }
    return crumbs;
  };

  const applyCommand = (blockId: string, type: BlockType) => {
    if (!activeNote) return;
    const block = activeNote.blocks.find(b => b.id === blockId);
    if (!block) return;

    let finalType = type;
    let content = block.content.replace('/', '');

    const updated = { 
      ...activeNote, 
      blocks: activeNote.blocks.map(b => b.id === blockId ? { ...b, type: finalType, content } : b) 
    };
    setActiveNote(updated);
    dispatch.updateNote(updated);
    setShowSlashMenu({ id: '', visible: false, category: 'Main' });
  };

  const renderBlock = (block: Block) => {
    const commonProps = {
      value: block.content,
      onChange: (e: any) => updateBlock(block.id, e.target.value),
      placeholder: block.type === BlockType.TEXT ? "Type '/' for commands..." : "",
      className: "w-full bg-transparent border-none outline-none resize-none py-1 leading-relaxed text-[#161617] font-normal"
    };

    switch (block.type) {
      case BlockType.H1: return <input {...commonProps} className={`${commonProps.className} text-4xl font-bold mt-8 mb-2 tracking-tight`} />;
      case BlockType.H2: return <input {...commonProps} className={`${commonProps.className} text-2xl font-bold mt-6 mb-1 tracking-tight`} />;
      case BlockType.H3: return <input {...commonProps} className={`${commonProps.className} text-xl font-bold mt-4 tracking-tight`} />;
      case BlockType.QUOTE: return <div className="border-l-3 border-[#161617]/20 pl-4 my-4"><textarea {...commonProps} className={`${commonProps.className} italic opacity-80`} /></div>;
      case BlockType.CALLOUT: return <div className="bg-[#F7F6F3] p-4 rounded-lg border border-[#EDECE9] flex gap-3 my-4"><span className="text-xl">💡</span><textarea {...commonProps} className={commonProps.className} /></div>;
      case BlockType.BULLET: return <div className="flex gap-2"><span className="opacity-40 mt-1.5">•</span><textarea {...commonProps} /></div>;
      case BlockType.CHECKBOX: return <div className="flex gap-2 items-start"><input type="checkbox" className="mt-2 w-4 h-4 rounded border-[#EDECE9] accent-[#2383E2]" /><textarea {...commonProps} /></div>;
      default: return <textarea {...commonProps} />;
    }
  };

  const MenuItem = ({ label, icon, onClick, hasSubmenu = false, isAssistant = false }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#F1F0EC] rounded-md transition-colors text-left ${isAssistant ? 'text-[#2383E2]' : 'text-[#161617]'}`}
    >
      <div className="flex items-center gap-3">
        <span className="w-5 flex justify-center text-sm opacity-60">{icon}</span>
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      {hasSubmenu && <span className="text-[10px] opacity-30">▶</span>}
    </button>
  );

  if (!activeNote) return (
    <div className="h-full flex items-center justify-center text-[#161617]/20 italic">Select a page to start writing.</div>
  );

  const crumbs = getBreadcrumbs();
  const children = state.notes.filter(n => n.parentId === activeNote.id);

  return (
    <div className="max-w-3xl mx-auto pb-60 animate-in fade-in duration-500 relative min-h-screen">
      {/* Requirement: Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-medium opacity-40">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.id}>
            <button onClick={() => onSelect(crumb.id)} className="hover:text-[#161617] hover:underline transition-all">
              {crumb.title || 'Untitled'}
            </button>
            {i < crumbs.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </nav>

      <div className="text-6xl mb-10 cursor-default select-none">
        <span className="p-2 rounded-2xl transition-colors hover:bg-[#EDECE9]">{activeNote.icon}</span>
      </div>
      
      <input 
        value={activeNote.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="w-full text-5xl font-black bg-transparent border-none outline-none placeholder-[#161617]/10 mb-8 tracking-tight text-[#161617]"
        placeholder="Untitled"
      />

      {/* Requirement: Child Pages flow */}
      {children.length > 0 && (
        <div className="mb-12 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2">Sub-pages</div>
          {children.map(child => (
            <button 
              key={child.id}
              onClick={() => onSelect(child.id)}
              className="flex items-center gap-3 w-full p-2 hover:bg-[#F1F0EC] rounded-lg transition-colors border border-transparent hover:border-[#EDECE9]"
            >
              <span>{child.icon}</span>
              <span className="text-sm font-medium">{child.title || 'Untitled Page'}</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        {activeNote.blocks.map((block) => (
          <div key={block.id} className="group relative">
            {renderBlock(block)}
            {showSlashMenu.visible && showSlashMenu.id === block.id && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#EDECE9] shadow-2xl rounded-xl z-50 p-2 animate-in zoom-in-95 duration-100 notion-shadow overflow-hidden">
                {showSlashMenu.category === 'Main' && (
                  <>
                    <MenuItem label="Heading 1" icon="H1" onClick={() => applyCommand(block.id, BlockType.H1)} />
                    <MenuItem label="Heading 2" icon="H2" onClick={() => applyCommand(block.id, BlockType.H2)} />
                    <MenuItem label="Bullet List" icon="•" onClick={() => applyCommand(block.id, BlockType.BULLET)} />
                    <MenuItem label="To-do List" icon="☑️" onClick={() => applyCommand(block.id, BlockType.CHECKBOX)} />
                    <MenuItem label="Callout" icon="💡" onClick={() => applyCommand(block.id, BlockType.CALLOUT)} />
                    <MenuItem label="Divider" icon="—" onClick={() => applyCommand(block.id, BlockType.DIVIDER)} />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => {
          const updated = { ...activeNote, blocks: [...activeNote.blocks, { id: Math.random().toString(36).substr(2, 9), type: BlockType.TEXT, content: '' }] };
          setActiveNote(updated);
          dispatch.updateNote(updated);
        }}
        className="mt-20 text-sm font-bold opacity-10 hover:opacity-100 flex items-center gap-3 transition-opacity w-full text-left py-4 hover:bg-[#F1F0EC] px-2 rounded-lg"
      >
        <span className="text-lg">+</span> New block
      </button>
    </div>
  );
};

export default NotesView;
