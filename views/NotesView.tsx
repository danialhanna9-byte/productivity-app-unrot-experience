
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedId) {
      const note = state.notes.find(n => n.id === selectedId);
      if (note) setActiveNote(note);
    } else if (state.notes.length > 0) {
      setActiveNote(state.notes[0]);
    }
  }, [selectedId, state.notes]);

  const updateBlock = (blockId: string, content: string) => {
    if (!activeNote) return;
    if (content.endsWith('/')) {
      setShowSlashMenu({ id: blockId, visible: true, category: 'Main' });
    } else {
      setShowSlashMenu({ id: '', visible: false, category: 'Main' });
    }

    const updatedNote = { ...activeNote, blocks: activeNote.blocks.map(b => b.id === blockId ? { ...b, content } : b) };
    setActiveNote(updatedNote);
    dispatch.updateNote(updatedNote);
  };

  const applyCommand = (blockId: string, type: BlockType) => {
    if (!activeNote) return;
    const block = activeNote.blocks.find(b => b.id === blockId);
    if (!block) return;

    let finalType = type;
    let content = block.content.replace('/', '');

    if (type === BlockType.TASK) {
      dispatch.addTask({
        id: Math.random().toString(36).substr(2, 9),
        title: content.trim() || 'Untitled Task from Note',
        description: `Source: ${activeNote.title}`,
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        difficulty: 1,
        points: 1,
        dueDate: new Date().toISOString(),
        tags: ['Reference'],
        category: 'Personal'
      });
      finalType = BlockType.CHECKBOX;
    }

    const updatedNote = { 
      ...activeNote, 
      blocks: activeNote.blocks.map(b => b.id === blockId ? { ...b, type: finalType, content } : b) 
    };
    setActiveNote(updatedNote);
    dispatch.updateNote(updatedNote);
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
      case BlockType.H4: return <input {...commonProps} className={`${commonProps.className} text-lg font-bold mt-3 tracking-tight`} />;
      case BlockType.H5: return <input {...commonProps} className={`${commonProps.className} text-base font-bold mt-2 tracking-tight`} />;
      case BlockType.H6: return <input {...commonProps} className={`${commonProps.className} text-sm font-bold mt-1 uppercase opacity-40 tracking-widest`} />;
      case BlockType.QUOTE: return <div className="border-l-3 border-[#161617]/20 pl-4 my-4"><textarea {...commonProps} className={`${commonProps.className} italic opacity-80`} /></div>;
      case BlockType.CALLOUT: return <div className="bg-[#F7F6F3] p-4 rounded-lg border border-[#EDECE9] flex gap-3 my-4"><span className="text-xl">💡</span><textarea {...commonProps} className={commonProps.className} /></div>;
      case BlockType.DIVIDER: return <div className="h-[1px] bg-[#EDECE9] my-6 w-full" />;
      case BlockType.CODE: return <textarea {...commonProps} className={`${commonProps.className} font-mono bg-[#F7F6F3] border border-[#EDECE9] text-[#161617] p-4 rounded-lg text-sm mt-4`} />;
      case BlockType.BULLET: return <div className="flex gap-2"><span className="opacity-40 mt-1.5">•</span><textarea {...commonProps} /></div>;
      case BlockType.NUMBERED: return <div className="flex gap-2"><span className="opacity-40 mt-1.5 font-bold">1.</span><textarea {...commonProps} /></div>;
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

  return (
    <div className="max-w-3xl mx-auto pb-60 animate-in fade-in duration-500 relative min-h-screen font-inter">
      <div className="text-6xl mb-10 mt-12 cursor-default select-none">
        <span className="p-2 rounded-2xl transition-colors hover:bg-[#EDECE9]">{activeNote.icon}</span>
      </div>
      
      <input 
        value={activeNote.title}
        onChange={(e) => {
          const updated = { ...activeNote, title: e.target.value };
          setActiveNote(updated);
          dispatch.updateNote(updated);
        }}
        className="w-full text-5xl font-black bg-transparent border-none outline-none placeholder-[#161617]/10 mb-16 tracking-tight text-[#161617]"
        placeholder="Untitled"
      />

      <div className="space-y-1">
        {activeNote.blocks.map((block) => (
          <div key={block.id} className="group relative">
            {renderBlock(block)}

            {showSlashMenu.visible && showSlashMenu.id === block.id && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#EDECE9] shadow-2xl rounded-xl z-50 p-2 animate-in zoom-in-95 duration-100 notion-shadow overflow-hidden">
                {showSlashMenu.category === 'Main' && (
                  <>
                    <MenuItem label="Assistant" icon="✨" isAssistant onClick={() => { dispatch.toggleAssistant(); setShowSlashMenu({ id: '', visible: false, category: 'Main' }); }} />
                    <div className="h-[1px] bg-[#EDECE9] my-2 mx-1" />
                    <MenuItem label="Paragraph" icon="¶" hasSubmenu onClick={() => setShowSlashMenu(p => ({...p, category: 'Paragraph'}))} />
                    <MenuItem label="Format" icon="🖌️" hasSubmenu onClick={() => setShowSlashMenu(p => ({...p, category: 'Format'}))} />
                    <MenuItem label="Insert" icon="⇥" hasSubmenu onClick={() => setShowSlashMenu(p => ({...p, category: 'Insert'}))} />
                    <div className="h-[1px] bg-[#EDECE9] my-2 mx-1" />
                    <MenuItem label="Add link" icon="🔗" />
                    <MenuItem label="Cut" icon="✂️" />
                    <MenuItem label="Copy" icon="📄" />
                    <MenuItem label="Paste" icon="📋" />
                    <MenuItem label="Select all" icon="◌" />
                  </>
                )}

                {showSlashMenu.category === 'Format' && (
                   <div className="animate-in slide-in-from-right-4 duration-200">
                    <button onClick={() => setShowSlashMenu(p => ({...p, category: 'Main'}))} className="px-3 py-2 text-[10px] font-black text-[#161617]/30 uppercase tracking-widest hover:underline">← Format Settings</button>
                    <MenuItem label="Bold" icon="B" onClick={() => applyCommand(block.id, BlockType.TEXT)} />
                    <MenuItem label="Italic" icon="I" onClick={() => applyCommand(block.id, BlockType.TEXT)} />
                    <MenuItem label="Strikethrough" icon="S" onClick={() => applyCommand(block.id, BlockType.TEXT)} />
                    <MenuItem label="Highlight" icon="H" onClick={() => applyCommand(block.id, BlockType.TEXT)} />
                   </div>
                )}

                {showSlashMenu.category === 'Paragraph' && (
                   <div className="animate-in slide-in-from-right-4 duration-200">
                    <button onClick={() => setShowSlashMenu(p => ({...p, category: 'Main'}))} className="px-3 py-2 text-[10px] font-black text-[#161617]/30 uppercase tracking-widest hover:underline">← Paragraph Styles</button>
                    <MenuItem label="Bullet list" icon="•" onClick={() => applyCommand(block.id, BlockType.BULLET)} />
                    <MenuItem label="Numbered list" icon="1." onClick={() => applyCommand(block.id, BlockType.NUMBERED)} />
                    <MenuItem label="Task list" icon="☑️" onClick={() => applyCommand(block.id, BlockType.TASK)} />
                    <div className="h-[1px] bg-[#EDECE9] my-2 mx-1" />
                    <MenuItem label="Heading 1" icon="H1" onClick={() => applyCommand(block.id, BlockType.H1)} />
                    <MenuItem label="Heading 2" icon="H2" onClick={() => applyCommand(block.id, BlockType.H2)} />
                    <MenuItem label="Heading 3" icon="H3" onClick={() => applyCommand(block.id, BlockType.H3)} />
                    <div className="h-[1px] bg-[#EDECE9] my-2 mx-1" />
                    <MenuItem label="Quote" icon="¶" onClick={() => applyCommand(block.id, BlockType.QUOTE)} />
                   </div>
                )}

                {showSlashMenu.category === 'Insert' && (
                  <div className="animate-in slide-in-from-right-4 duration-200">
                    <button onClick={() => setShowSlashMenu(p => ({...p, category: 'Main'}))} className="px-3 py-2 text-[10px] font-black text-[#161617]/30 uppercase tracking-widest hover:underline">← Insert Items</button>
                    <MenuItem label="Callout" icon="💡" onClick={() => applyCommand(block.id, BlockType.CALLOUT)} />
                    <MenuItem label="Divider" icon="—" onClick={() => applyCommand(block.id, BlockType.DIVIDER)} />
                    <MenuItem label="Code block" icon="<>" onClick={() => applyCommand(block.id, BlockType.CODE)} />
                  </div>
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
        <span className="text-lg">+</span> Add a block
      </button>
    </div>
  );
};

export default NotesView;
