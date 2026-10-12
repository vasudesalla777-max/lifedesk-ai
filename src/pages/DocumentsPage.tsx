import React, { useState, useRef, useMemo } from 'react';
import { Upload, Trash2, FileText, Search, Download, File, Image, Film, FileCode } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Document } from '../types';

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase()??'';
  if (['jpg','jpeg','png','gif','svg','webp'].includes(ext)) return <Image size={20} />;
  if (['mp4','mov','avi','mkv','webm'].includes(ext)) return <Film size={20} />;
  if (['js','ts','jsx','tsx','py','rb','go','java','html','css','json'].includes(ext)) return <FileCode size={20} />;
  return <File size={20} />;
};

const fmtSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes<1024) return `${bytes} B`;
  if (bytes<1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
};

export const DocumentsPage: React.FC = () => {
  const { documents, uploadDocument, deleteDocument } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch]         = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFiles = async (files: FileList|null) => {
    if (!files||files.length===0) return;
    setUploading(true); setUploadError('');
    try { await Promise.all(Array.from(files).map(f => uploadDocument(f))); }
    catch { setUploadError('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  const filtered = useMemo(() => documents.filter((d: Document) => !search || (d.file_name || d.name || '').toLowerCase().includes(search.toLowerCase())), [documents, search]);
  const recent   = useMemo(() => [...documents].sort((a,b) => new Date(b.created_at??0).getTime()-new Date(a.created_at??0).getTime()).slice(0,4), [documents]);

  return (
    <div className="page-enter" style={{ padding:'2rem',maxWidth:900,margin:'0 auto' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem',fontWeight:800,color:'#f1f5f9',margin:0 }}>Documents</h1>
          <p style={{ color:'#64748b',margin:'0.25rem 0 0',fontSize:'0.875rem' }}>{documents.length} file{documents.length!==1?'s':''}</p>
        </div>
        <div style={{ position:'relative' }}>
          <Search size={15} style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" aria-label="Search documents" className="field" style={{ paddingLeft:'2rem',width:200 }} />
        </div>
      </div>

      <div role="button" aria-label="Upload files" tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={e => (e.key==='Enter'||e.key===' ') && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{ border:`2px dashed ${dragOver?'#8b5cf6':'rgba(139,92,246,0.3)'}`,borderRadius:16,padding:'2.5rem 1.5rem',textAlign:'center',cursor:'pointer',marginBottom:'1.75rem',background:dragOver?'rgba(139,92,246,0.08)':'rgba(139,92,246,0.03)',transition:'all 0.2s' }}>
        <Upload size={32} style={{ color:'#8b5cf6',marginBottom:'0.75rem' }} />
        <p style={{ margin:0,fontSize:'0.95rem',fontWeight:600,color:'#e2e8f0' }}>{uploading?'Uploading…':'Drop files here or click to upload'}</p>
        <p style={{ margin:'0.25rem 0 0',fontSize:'0.78rem',color:'#475569' }}>Any file type supported</p>
        {uploadError && <p role="alert" style={{ margin:'0.75rem 0 0',fontSize:'0.8rem',color:'#ef4444' }}>{uploadError}</p>}
      </div>
      <input ref={fileRef} type="file" multiple hidden onChange={e => handleFiles(e.target.files)} />

      {!search && recent.length > 0 && (
        <div style={{ marginBottom:'1.75rem' }}>
          <h2 style={{ fontSize:'0.8rem',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 0.875rem' }}>Recent</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'0.75rem' }}>
            {recent.map((doc: Document) => (
              <div key={doc.id} className="glass-card" style={{ padding:'0.875rem',display:'flex',flexDirection:'column',gap:'0.5rem' }}>
                <span style={{ color:'#8b5cf6' }}>{getFileIcon(doc.file_name || doc.name || 'file.txt')}</span>
                <p style={{ margin:0,fontSize:'0.8rem',fontWeight:600,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{doc.file_name || doc.name || 'Untitled Document'}</p>
                <p style={{ margin:0,fontSize:'0.7rem',color:'#475569' }}>{doc.created_at?new Date(doc.created_at).toLocaleDateString('en-IN'):''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="ld-empty">
          <span className="ld-empty-icon"><FileText size={40} /></span>
          <p className="ld-empty-title">{search?'No files found':'No documents yet'}</p>
          <p className="ld-empty-desc">{search?'Try a different search.':'Upload your first file above.'}</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {['File','Size','Uploaded',''].map(h => <th key={h} style={{ padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc: Document) => (
                  <tr key={doc.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.15s' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background='rgba(255,255,255,0.02)')}
                    onMouseLeave={ev => (ev.currentTarget.style.background='transparent')}>
                    <td style={{ padding:'0.75rem 1rem' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'0.625rem' }}>
                        <span style={{ color:'#8b5cf6',flexShrink:0 }}>{getFileIcon(doc.file_name || doc.name || 'file.txt')}</span>
                        <span style={{ fontSize:'0.875rem',color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:300 }}>{doc.file_name || doc.name || 'Untitled Document'}</span>
                      </div>
                    </td>
                    <td style={{ padding:'0.75rem 1rem',fontSize:'0.78rem',color:'#475569',whiteSpace:'nowrap' }}>{fmtSize(doc.file_size || doc.size)}</td>
                    <td style={{ padding:'0.75rem 1rem',fontSize:'0.78rem',color:'#475569',whiteSpace:'nowrap' }}>{doc.created_at?new Date(doc.created_at).toLocaleDateString('en-IN'):'—'}</td>
                    <td style={{ padding:'0.75rem 1rem' }}>
                      <div style={{ display:'flex',gap:'0.25rem',justifyContent:'flex-end' }}>
                        {(doc.file_url || doc.url) && <a href={doc.file_url || doc.url} download target="_blank" rel="noopener noreferrer" className="btn-icon" title="Download" aria-label={`Download ${doc.file_name || doc.name}`} style={{ display:'inline-flex',alignItems:'center',justifyContent:'center' }}><Download size={14} /></a>}
                        <button type="button" onClick={() => deleteDocument(doc.id)} className="btn-icon" aria-label={`Delete ${doc.file_name || doc.name}`} style={{ color:'#ef4444' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentsPage;
