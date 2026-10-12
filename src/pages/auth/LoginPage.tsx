import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageView } from '../../types';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Database, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageView) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isLoading, isCloudConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    const res = await login(email, password);
    if (res.success) onNavigate('dashboard');
    else setError(res.error || 'Login failed. Check your credentials.');
  };

  return (
    <div className="min-h-screen bg-[#07080a] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Dot texture */}
      <div className="fixed inset-0 dot-texture opacity-100 pointer-events-none" />

      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[500px] h-[300px] blur-[120px] opacity-15 bg-amber-500 rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-3 group mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-amber-500/30 blur-sm" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              LifeDesk <span className="text-amber-400">AI</span>
            </span>
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-600 mt-1.5">Sign in to your personal AI workspace</p>

          {/* Connection badge */}
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] font-semibold border ${
            isCloudConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500' } anim-pulse-glow`} />
            {isCloudConnected ? 'Supabase Cloud' : 'Local Storage Mode'}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-t-2xl" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="field pl-10" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-500">Password</label>
                <button type="button" onClick={() => onNavigate('forgot-password')}
                  className="text-[11px] text-amber-500 hover:text-amber-400 transition-colors font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60">
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-[11px] text-slate-700">or</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-600">Protected by Supabase Row Level Security — your data is private even at database level.</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            No account?{' '}
            <button onClick={() => onNavigate('register')}
              className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              Create one free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
