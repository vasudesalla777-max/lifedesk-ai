import React, { useState } from 'react';
import { Palette, Bell, Shield, Brain, User, Eye, EyeOff, LogOut, Trash2, Check, ChevronRight, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfilePhotoModal } from '../components/common/ProfilePhotoModal';

type Section = 'appearance' | 'notifications' | 'privacy' | 'ai' | 'account';

interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; id: string; label: string; }

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, id, label }) => (
  <button type="button" id={id} role="switch" aria-checked={checked} aria-label={label}
    onClick={() => onChange(!checked)}
    style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#8b5cf6' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', padding: 0, position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
    <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
  </button>
);

const Row: React.FC<{ label: string; desc?: string; children: React.ReactNode }> = ({ label, desc, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '1rem' }}>
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>{label}</p>
      {desc && <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#475569' }}>{desc}</p>}
    </div>
    {children}
  </div>
);

export const SettingsPage: React.FC = () => {
  const { user, updatePassword, signOut, deleteAccount } = useAuth();
  const [section, setSection]     = useState<Section>('appearance');
  const [theme, setTheme]         = useState<'dark'|'system'>('dark');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [emailNotif, setEmail]    = useState(true);
  const [pushNotif, setPush]      = useState(false);
  const [taskNotif, setTask]      = useState(true);
  const [weeklyDigest, setWeekly] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [sessionData, setSession] = useState(true);
  const [aiMemory, setAiMemory]   = useState(true);
  const [aiSuggest, setAiSuggest] = useState(true);
  const [autoSumm, setAutoSumm]   = useState(false);
  const [currPass, setCurrPass]   = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confPass, setConfPass]   = useState('');
  const [showCurr, setShowCurr]   = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [passLoading, setPassLoad] = useState(false);
  const [passErr, setPassErr]     = useState('');
  const [passOk, setPassOk]       = useState(false);
  const [delConfirm, setDelConf]  = useState('');
  const [delLoading, setDelLoad]  = useState(false);
  const [delErr, setDelErr]       = useState('');

  const handlePassword = async () => {
    if (!currPass||!newPass||newPass!==confPass) { setPassErr(newPass!==confPass?'Passwords do not match.':'Fill in all fields.'); return; }
    setPassLoad(true); setPassErr(''); setPassOk(false);
    try { await updatePassword(currPass, newPass); setPassOk(true); setCurrPass(''); setNewPass(''); setConfPass(''); }
    catch { setPassErr('Failed to update password. Check your current password.'); }
    finally { setPassLoad(false); }
  };

  const handleDelete = async () => {
    if (delConfirm!==(user?.email??'')) { setDelErr('Email does not match.'); return; }
    setDelLoad(true); setDelErr('');
    try { await deleteAccount(); }
    catch { setDelErr('Failed to delete account. Contact support.'); }
    finally { setDelLoad(false); }
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id:'appearance',    label:'Appearance',    icon:<Palette size={16}/> },
    { id:'notifications', label:'Notifications', icon:<Bell size={16}/> },
    { id:'privacy',       label:'Privacy',       icon:<Shield size={16}/> },
    { id:'ai',            label:'AI Settings',   icon:<Brain size={16}/> },
    { id:'account',       label:'Account',       icon:<User size={16}/> },
  ];

  return (
    <div className="page-enter" style={{ padding:'2rem',maxWidth:860,margin:'0 auto' }}>
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontSize:'1.75rem',fontWeight:800,color:'#f1f5f9',margin:0 }}>Settings</h1>
        <p style={{ color:'#64748b',margin:'0.25rem 0 0',fontSize:'0.875rem' }}>Manage your preferences and account</p>
      </div>

      <div style={{ display:'flex',gap:'1.5rem',flexWrap:'wrap',alignItems:'flex-start' }}>
        {/* Sidebar */}
        <nav aria-label="Settings sections" style={{ width:200,flexShrink:0,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'0.5rem',minWidth:160 }}>
          {navItems.map(item => (
            <button key={item.id} type="button" onClick={() => setSection(item.id)}
              aria-current={section===item.id?'page':undefined}
              style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.625rem',padding:'0.625rem 0.875rem',borderRadius:10,border:'none',cursor:'pointer',background:section===item.id?'rgba(139,92,246,0.18)':'transparent',color:section===item.id?'#a78bfa':'#64748b',fontWeight:section===item.id?700:500,fontSize:'0.85rem',textAlign:'left',transition:'all 0.15s' }}>
              <span style={{ display:'flex',alignItems:'center',gap:'0.5rem' }}>{item.icon} {item.label}</span>
              {section===item.id && <ChevronRight size={13} />}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ flex:1,minWidth:280 }}>
          {section==='appearance' && (
            <div className="glass-card" style={{ padding:'1.5rem' }}>
              <h2 style={{ margin:'0 0 1.25rem',fontSize:'1rem',fontWeight:700,color:'#f1f5f9' }}>Appearance</h2>
              <Row label="Theme" desc="Choose your preferred colour mode">
                <div style={{ display:'flex',gap:'0.5rem' }}>
                  {(['dark','system'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setTheme(t)}
                      style={{ padding:'0.3rem 0.875rem',borderRadius:8,fontSize:'0.78rem',fontWeight:600,border:'1px solid',borderColor:theme===t?'#8b5cf6':'rgba(255,255,255,0.1)',background:theme===t?'rgba(139,92,246,0.2)':'transparent',color:theme===t?'#a78bfa':'#64748b',cursor:'pointer' }}>
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                </div>
              </Row>
            </div>
          )}

          {section==='notifications' && (
            <div className="glass-card" style={{ padding:'1.5rem' }}>
              <h2 style={{ margin:'0 0 1.25rem',fontSize:'1rem',fontWeight:700,color:'#f1f5f9' }}>Notifications</h2>
              <Row label="Email notifications" desc="Receive important updates via email"><Toggle id="notif-email" checked={emailNotif} onChange={setEmail} label="Email notifications" /></Row>
              <Row label="Push notifications" desc="Browser push alerts"><Toggle id="notif-push" checked={pushNotif} onChange={setPush} label="Push notifications" /></Row>
              <Row label="Task reminders" desc="Get reminded about upcoming tasks"><Toggle id="notif-task" checked={taskNotif} onChange={setTask} label="Task reminders" /></Row>
              <Row label="Weekly digest" desc="A summary of your week every Monday"><Toggle id="notif-weekly" checked={weeklyDigest} onChange={setWeekly} label="Weekly digest" /></Row>
            </div>
          )}

          {section==='privacy' && (
            <div className="glass-card" style={{ padding:'1.5rem' }}>
              <h2 style={{ margin:'0 0 1.25rem',fontSize:'1rem',fontWeight:700,color:'#f1f5f9' }}>Privacy</h2>
              <Row label="Usage analytics" desc="Help improve LifeDesk with anonymous usage data"><Toggle id="priv-analytics" checked={analytics} onChange={setAnalytics} label="Usage analytics" /></Row>
              <Row label="Session data" desc="Store session history for personalisation"><Toggle id="priv-session" checked={sessionData} onChange={setSession} label="Session data" /></Row>
            </div>
          )}

          {section==='ai' && (
            <div className="glass-card" style={{ padding:'1.5rem' }}>
              <h2 style={{ margin:'0 0 1.25rem',fontSize:'1rem',fontWeight:700,color:'#f1f5f9' }}>AI Settings</h2>
              <Row label="AI Memory" desc="Let the AI remember your preferences across sessions"><Toggle id="ai-memory" checked={aiMemory} onChange={setAiMemory} label="AI Memory" /></Row>
              <Row label="Smart suggestions" desc="Proactive AI recommendations based on your data"><Toggle id="ai-suggest" checked={aiSuggest} onChange={setAiSuggest} label="Smart suggestions" /></Row>
              <Row label="Auto-summarise notes" desc="Automatically generate AI summaries for new notes"><Toggle id="ai-summ" checked={autoSumm} onChange={setAutoSumm} label="Auto-summarise notes" /></Row>
              <div style={{ marginTop:'1rem',padding:'0.875rem',borderRadius:10,background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.15)' }}>
                <p style={{ margin:0,fontSize:'0.78rem',color:'#94a3b8' }}><strong style={{ color:'#a78bfa' }}>AI Model</strong> · Powered by your configured AI backend</p>
              </div>
            </div>
          )}

          {section==='account' && (
            <div style={{ display:'flex',flexDirection:'column',gap:'1.25rem' }}>
              {/* Profile Photo */}
              <div className="glass-card" style={{ padding:'1.5rem' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'1rem' }}>
                    <div style={{ position:'relative',width:56,height:56,borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(245,158,11,0.4)',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name || 'Profile'} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                      ) : (
                        <span style={{ fontSize:'1.2rem',fontWeight:800,color:'#f59e0b' }}>
                          {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 style={{ margin:0,fontSize:'1rem',fontWeight:700,color:'#f1f5f9' }}>Profile Photo</h2>
                      <p style={{ margin:'0.15rem 0 0',fontSize:'0.75rem',color:'#64748b' }}>
                        {user?.avatar_url ? 'Custom profile photo active' : 'Default initials avatar'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="btn-primary"
                    style={{ display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem' }}
                  >
                    <Camera size={14} /> Change Photo
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div className="glass-card" style={{ padding:'1.5rem' }}>
                <h2 style={{ margin:'0 0 1.25rem',fontSize:'1rem',fontWeight:700,color:'#f1f5f9' }}>Change Password</h2>
                <div style={{ display:'flex',flexDirection:'column',gap:'0.875rem' }}>
                  <div>
                    <label className="field-label" htmlFor="curr-pass">Current Password</label>
                    <div style={{ position:'relative' }}>
                      <input id="curr-pass" type={showCurr?'text':'password'} value={currPass} onChange={e => setCurrPass(e.target.value)} className="field" style={{ paddingRight:'2.5rem' }} autoComplete="current-password" />
                      <button type="button" onClick={() => setShowCurr(v=>!v)} aria-label={showCurr?'Hide':'Show'} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#475569' }}>{showCurr?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                    </div>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="new-pass">New Password</label>
                    <div style={{ position:'relative' }}>
                      <input id="new-pass" type={showNew?'text':'password'} value={newPass} onChange={e => setNewPass(e.target.value)} className="field" style={{ paddingRight:'2.5rem' }} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowNew(v=>!v)} aria-label={showNew?'Hide':'Show'} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#475569' }}>{showNew?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                    </div>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="conf-pass">Confirm New Password</label>
                    <input id="conf-pass" type="password" value={confPass} onChange={e => setConfPass(e.target.value)} className="field" autoComplete="new-password" />
                  </div>
                  {passErr && <p role="alert" style={{ margin:0,fontSize:'0.8rem',color:'#ef4444' }}>{passErr}</p>}
                  {passOk  && <p role="status" style={{ margin:0,fontSize:'0.8rem',color:'#22c55e',display:'flex',alignItems:'center',gap:'0.3rem' }}><Check size={13}/> Password updated.</p>}
                  <button type="button" onClick={handlePassword} disabled={passLoading} aria-busy={passLoading} className="btn-primary" style={{ alignSelf:'flex-start' }}>{passLoading?'Updating…':'Update Password'}</button>
                </div>
              </div>

              {/* Sign Out */}
              <div className="glass-card" style={{ padding:'1.5rem' }}>
                <h2 style={{ margin:'0 0 0.5rem',fontSize:'1rem',fontWeight:700,color:'#f1f5f9' }}>Sign Out</h2>
                <p style={{ margin:'0 0 1rem',fontSize:'0.85rem',color:'#64748b' }}>You will be signed out of your account.</p>
                <button type="button" onClick={signOut} className="btn-ghost" style={{ display:'flex',alignItems:'center',gap:'0.4rem',color:'#94a3b8' }}><LogOut size={15}/> Sign Out</button>
              </div>

              {/* Delete Account */}
              <div className="glass-card" style={{ padding:'1.5rem',border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.04)' }}>
                <h2 style={{ margin:'0 0 0.5rem',fontSize:'1rem',fontWeight:700,color:'#fca5a5' }}>Delete Account</h2>
                <p style={{ margin:'0 0 1rem',fontSize:'0.85rem',color:'#64748b',lineHeight:1.6 }}>This permanently deletes your account and all data. This cannot be undone.</p>
                <div style={{ display:'flex',flexDirection:'column',gap:'0.75rem' }}>
                  <div>
                    <label className="field-label" htmlFor="del-confirm" style={{ color:'#94a3b8' }}>Type your email <strong style={{ color:'#e2e8f0' }}>{user?.email}</strong> to confirm</label>
                    <input id="del-confirm" type="email" value={delConfirm} onChange={e => setDelConf(e.target.value)} placeholder={user?.email??'your@email.com'} className="field" style={{ borderColor:'rgba(239,68,68,0.3)' }} />
                  </div>
                  {delErr && <p role="alert" style={{ margin:0,fontSize:'0.8rem',color:'#ef4444' }}>{delErr}</p>}
                  <button type="button" onClick={handleDelete} disabled={delLoading||delConfirm!==(user?.email??'')} aria-busy={delLoading} className="btn-danger" style={{ alignSelf:'flex-start',display:'flex',alignItems:'center',gap:'0.4rem' }}>
                    <Trash2 size={15}/>{delLoading?'Deleting…':'Delete My Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Photo Studio Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
