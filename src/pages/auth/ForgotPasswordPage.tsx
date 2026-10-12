import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageView } from '../../types';
import { Sparkles, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: PageView) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Please enter your email.'); return; }
    const res = await resetPassword(email);
    if (res?.success) setSent(true);
    else setError(res?.error || 'Failed to send reset email.');
  };

  return (
    <div className="min-h-screen bg-[#07080a] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 dot-texture opacity-100 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[400px] h-[250px] blur-[100px] opacity-12 bg-amber-500 rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-amber-500/30 blur-sm" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            </div>
            <span className="text-xl font-extrabold text-white">LifeDesk <span className="text-amber-400">AI</span></span>
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-600 mt-1.5">Enter your email to receive a reset link</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-t-2xl" />

          {sent ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Email Sent!</h3>
                <p className="text-sm text-slate-500">
                  Check <span className="text-amber-400">{email}</span> for your reset link.
                </p>
              </div>
              <button onClick={() => onNavigate('login')} className="btn-primary w-full justify-center">
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="field pl-10" />
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
                {isLoading
                  ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending…</>
                  : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
              </button>

              <button type="button" onClick={() => onNavigate('login')}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-600
                  hover:text-slate-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
