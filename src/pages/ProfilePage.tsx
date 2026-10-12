import React, { useState, useRef } from 'react';
import { Camera, Pencil, Check, X, ListTodo, CheckCircle2, FileText, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CreatorProfileCard } from '../components/chat/CreatorProfileCard';
import { ProfilePhotoModal } from '../components/common/ProfilePhotoModal';

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const getInitials = (name?: string, email?: string): string => {
  const src = name?.trim() || email?.trim() || 'U';
  return src.split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { tasks, notes, expenses, documents, totalMonthlySpend } = useData();

  const [editing, setEditing]      = useState(false);
  const [fullName, setFullName]    = useState(user?.full_name ?? '');
  const [username, setUsername]    = useState(user?.username ?? '');
  const [bio, setBio]              = useState(user?.bio ?? '');
  const [location, setLocation]    = useState(user?.location ?? '');
  const [website, setWebsite]      = useState(user?.website ?? '');
  const [saving, setSaving]        = useState(false);
  const [saveError, setSaveError]  = useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      await updateProfile({ full_name: fullName.trim(), username: username.trim(), bio: bio.trim(), location: location.trim(), website: website.trim() });
      setEditing(false);
    } catch { setSaveError('Failed to save profile. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setFullName(user?.full_name ?? ''); setUsername(user?.username ?? '');
    setBio(user?.bio ?? ''); setLocation(user?.location ?? ''); setWebsite(user?.website ?? '');
    setEditing(false); setSaveError('');
  };

  const completedTasks = tasks.filter((t: any) => t.completed || t.status === 'Completed').length;
  const completionPct  = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const initials       = getInitials(user?.full_name, user?.email);

  return (
    <div className="page-enter" style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Interactive Avatar with Glow & Modal Trigger */}
          <div className="relative group cursor-pointer shrink-0" onClick={() => setIsPhotoModalOpen(true)}>
            {/* Glowing outer aura */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500 blur-md opacity-40 group-hover:opacity-75 transition-opacity" />

            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-slate-950 flex items-center justify-center shadow-xl">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name ?? 'Profile photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-2xl font-black text-white">
                  {initials}
                </div>
              )}

              {/* Hover overlay with Camera */}
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200">
                <Camera className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] font-bold mt-1 text-slate-200">Change</span>
              </div>
            </div>

            {/* Camera Floating Pill Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhotoModalOpen(true);
              }}
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-2 border-slate-950 shadow-md transition-transform hover:scale-110"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Photo Action & Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all mb-2 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                {user?.avatar_url ? 'Update Photo' : 'Add Profile Photo'}
              </button>
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.75rem' }}>
                  <div>
                    <label className="field-label" htmlFor="pf-name">Full Name</label>
                    <input id="pf-name" value={fullName} onChange={e => setFullName(e.target.value)} className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="pf-user">Username</label>
                    <input id="pf-user" value={username} onChange={e => setUsername(e.target.value)} className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="pf-loc">Location</label>
                    <input id="pf-loc" value={location} onChange={e => setLocation(e.target.value)} className="field" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="pf-web">Website</label>
                    <input id="pf-web" value={website} onChange={e => setWebsite(e.target.value)} className="field" />
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="pf-bio">Bio</label>
                  <textarea id="pf-bio" value={bio} onChange={e => setBio(e.target.value)} className="field" rows={3} style={{ resize: 'vertical' }} />
                </div>
                {saveError && <p role="alert" style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444' }}>{saveError}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={handleSave} disabled={saving} aria-busy={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Check size={15} />{saving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <X size={15} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>
                    {user?.full_name || user?.email?.split('@')[0] || 'User'}
                  </h1>
                  {user?.username && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>@{user.username}</span>}
                  <button type="button" onClick={() => setEditing(true)} className="btn-icon" aria-label="Edit profile"><Pencil size={15} /></button>
                </div>
                {user?.email && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{user.email}</p>}
                {user?.bio && <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>{user.bio}</p>}
                {(user?.location || user?.website) && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {user.location && <span style={{ fontSize: '0.8rem', color: '#475569' }}>📍 {user.location}</span>}
                    {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#8b5cf6', textDecoration: 'none' }}>🌐 {user.website}</a>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {([
          { label: 'Tasks',      val: String(tasks.length),                            icon: <ListTodo size={16} />,     color: '#f59e0b' },
          { label: 'Completed',  val: String(completedTasks),                          icon: <CheckCircle2 size={16} />, color: '#22c55e' },
          { label: 'Notes',      val: String(notes.length),                            icon: <FileText size={16} />,     color: '#3b82f6' },
          { label: 'Expenses',   val: String(expenses.length),                         icon: <DollarSign size={16} />,   color: '#ef4444' },
          { label: 'Docs',       val: String(documents.length),                        icon: <FileText size={16} />,     color: '#8b5cf6' },
          { label: 'This Month', val: '₹' + totalMonthlySpend.toLocaleString(),        icon: <TrendingUp size={16} />,   color: '#f97316' },
        ] as { icon: React.ReactNode; label: string; val: string; color: string }[]).map(({ icon, label, val, color }) => (
          <div key={label} className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#475569' }}>{label}</p>
                <p style={{ margin: '0.35rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>{val}</p>
              </div>
              <span style={{ color, opacity: 0.75 }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Task Completion */}
      {tasks.length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Task Completion</p>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>{completionPct}%</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', transition: 'width 0.6s ease' }} />
          </div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#475569' }}>{completedTasks} of {tasks.length} tasks completed</p>
        </div>
      )}

      {/* Account Info */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>Account Info</p>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '0.75rem 2rem' }}>
          {([{ label:'Email', val:user?.email??'—' },{ label:'Plan', val:user?.plan??'Free' },{ label:'Member since', val:fmtDate(user?.created_at) },{ label:'Phone', val:user?.phone??'—' }]).map(({ label, val }) => (
            <div key={label}>
              <dt style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, marginBottom: '0.15rem' }}>{label}</dt>
              <dd style={{ margin: 0, fontSize: '0.875rem', color: '#e2e8f0' }}>{val}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Creator Profile */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <p style={{ margin: '0 0 0.875rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>About This App</p>
        <CreatorProfileCard compact={false} />
      </div>

      {/* Profile Photo Studio Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
