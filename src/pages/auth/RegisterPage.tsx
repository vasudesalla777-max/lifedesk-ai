import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageView } from '../../types';
import { Sparkles, Lock, Mail, User, ArrowRight, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: PageView) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const res = await register(email, password, fullName);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => onNavigate('login'), 3000);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center px-4">
        <div className="dot-texture fixed inset-0 pointer-events-none" />
        <div className="relative z-10 glass-card p-10 max-w-md w-full text-center rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Account Created!</h2>
          <p className="text-sm text-slate-500">
            Check your email to confirm your account, then sign in to access your workspace.
          </p>
          <div className="mt-5 flex items-center gap-2 justify-center text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 anim-pulse-glow" />
            Redirecting to login in 3 seconds…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080a] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 dot-texture opacity-100 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[500px] h-[300px] blur-[120px] opacity-12 bg-amber-500 rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-3 group mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-amber-500/30 blur-sm" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            </div>
            <span className="text-xl font-extrabold text-white">LifeDesk <span className="text-amber-400">AI</span></span>
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create account</h1>
          <p className="text-sm text-slate-600 mt-1.5">Start organizing your life with AI</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-t-2xl" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Doe" required className="field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required className="field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat password" required className="field pl-10" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 mt-1">
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating account…</>
                : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <button onClick={() => onNavigate('login')}
              className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
