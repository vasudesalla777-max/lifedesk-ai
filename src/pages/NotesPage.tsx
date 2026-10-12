import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, Check, X, Sparkles, FileText, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Note } from '../types';

interface NotesPageProps {
  isNewNoteModalOpen?: boolean;
  setIsNewNoteModalOpen?: (open: boolean) => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({ isNewNoteModalOpen, setIsNewNoteModalOpen }) => {
  const { notes, addNote, updateNote, deleteNote, summarizeNoteAI } = useData();
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [editId, setEditId]     = useState<string|null>(null);
  const [editTitle, setET]      = useState('');
  const [editBody, setEB]       = useState('');
  const [search, setSearch]     = useState('');
  const [summaries, setSummaries] = useState<Record<string,string>>({});
  const [aiLoading, setAiLoad]  = useState<Record<string,boolean>>({});
  const titleInputRef           = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isNewNoteModalOpen) {
      titleInputRef.current?.focus();
      setIsNewNoteModalOpen?.(false);
    }
  }, [isNewNoteModalOpen, setIsNewNoteModalOpen]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    await addNote({ title: title.trim(), content: body.trim(), body: body.trim() });
    setTitle(''); setBody('');
  };

  const startEdit = (note: Note) => { setEditId(note.id); setET(note.title); setEB(note.content || note.body || ''); };

  const saveEdit = async () => {
    if (!editId) return;
    await updateNote(editId, { title: editTitle.trim(), content: editBody.trim(), body: editBody.trim() });
    setEditId(null);
  };

  const handleSummarize = async (note: Note) => {
    setAiLoad(p => ({ ...p, [note.id]: true }));
    try { setSummaries(p => ({ ...p, [note.id]: '' })); const s = await summarizeNoteAI(note); setSummaries(p => ({ ...p, [note.id]: s ?? '' })); }
    finally { setAiLoad(p => ({ ...p, [note.id]: false })); }
  };

  const filtered = useMemo(() => notes.filter((n: Note) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.content || n.body || '').toLowerCase().includes(search.toLowerCase())
  ), [notes, search]);

  return (
    <div className="page-enter" style={{ padding:'2rem',maxWidth:860,margin:'0 auto' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem',fontWeight:800,color:'#f1f5f9',margin:0 }}>Notes</h1>
          <p style={{ color:'#64748b',margin:'0.25rem 0 0',fontSize:'0.875rem' }}>{notes.length} note{notes.length!==1?'s':''}</p>
        </div>
        <div style={{ position:'relative' }}>
          <Search size={15} style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…" aria-label="Search notes" className="field" style={{ paddingLeft:'2rem',width:200 }} />
        </div>
      </div>

      <div className="glass-card" style={{ padding:'1.25rem',marginBottom:'1.5rem' }}>
        <div style={{ display:'flex',flexDirection:'column',gap:'0.75rem' }}>
          <input ref={titleInputRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title…" aria-label="Note title" className="field" />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your note here…" aria-label="Note body" className="field" rows={3} style={{ resize:'vertical' }} />
          <div style={{ display:'flex',justifyContent:'flex-end' }}>
            <button type="button" onClick={handleAdd} className="btn-primary" style={{ display:'flex',alignItems:'center',gap:'0.4rem' }}><Plus size={15} /> Add Note</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ld-empty">
          <span className="ld-empty-icon"><FileText size={40} /></span>
          <p className="ld-empty-title">{search?'No matches found':'No notes yet'}</p>
          <p className="ld-empty-desc">{search?'Try a different search term.':'Add your first note above.'}</p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem' }}>
          {filtered.map((note: Note) => (
            <div key={note.id} className="glass-card" style={{ padding:'1.25rem',display:'flex',flexDirection:'column',gap:'0.75rem' }}>
              {editId===note.id ? (
                <>
                  <input value={editTitle} onChange={e => setET(e.target.value)} className="field" aria-label="Edit title" />
                  <textarea value={editBody} onChange={e => setEB(e.target.value)} className="field" rows={4} style={{ resize:'vertical' }} aria-label="Edit body" />
                  <div style={{ display:'flex',gap:'0.5rem',justifyContent:'flex-end' }}>
                    <button type="button" onClick={() => setEditId(null)} className="btn-ghost" style={{ display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.8rem' }}><X size={13} /> Cancel</button>
                    <button type="button" onClick={saveEdit} className="btn-primary" style={{ display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.8rem' }}><Check size={13} /> Save</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9' }}>{note.title}</h3>
                  {(note.content || note.body) && <p style={{ margin:0,fontSize:'0.82rem',color:'#94a3b8',lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{note.content || note.body}</p>}
                  {summaries[note.id] && (
                    <div style={{ background:'rgba(139,92,246,0.08)',borderRadius:8,padding:'0.6rem 0.75rem',fontSize:'0.78rem',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.2)' }}>
                      <strong>AI Summary:</strong> {summaries[note.id]}
                    </div>
                  )}
                  <div style={{ display:'flex',gap:'0.4rem',marginTop:'auto',justifyContent:'flex-end',paddingTop:'0.25rem' }}>
                    <button type="button" onClick={() => handleSummarize(note)} disabled={aiLoading[note.id]} aria-busy={aiLoading[note.id]} className="btn-icon" title="AI Summarize" style={{ color:'#8b5cf6' }}><Sparkles size={15} /></button>
                    <button type="button" onClick={() => startEdit(note)} className="btn-icon" title="Edit"><Pencil size={15} /></button>
                    <button type="button" onClick={() => deleteNote(note.id)} className="btn-icon" title="Delete" style={{ color:'#ef4444' }} aria-label={`Delete ${note.title}`}><Trash2 size={15} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotesPage;
