import React, { useState, useEffect } from 'react';
import { PageView } from '../types';
import { ThreeFloatingHero } from '../components/3d/ThreeFloatingHero';
import { ThreeTiltCard } from '../components/3d/ThreeTiltCard';
import {
  Sparkles, CheckSquare, FileText, DollarSign, FolderLock,
  ArrowRight, Bot, BrainCircuit, Database, Shield, Zap,
  ChevronRight, Menu, X, CheckCircle, Activity,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: PageView) => void;
  onOpenSupabaseModal?: () => void;
}

// ── Hero Visual Panel (right side) with Real 3D WebGL Element ───────────────
const HeroVisual: React.FC = () => (
  <div className="relative w-full max-w-[540px] h-[540px] mx-auto flex items-center justify-center">
    {/* Ambient glow behind panel */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
      w-96 h-96 rounded-full blur-[110px] opacity-25
      bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-500 pointer-events-none" />

    {/* Real Interactive 3D WebGL Canvas Centerpiece */}
    <div className="relative w-full h-full">
      <ThreeFloatingHero className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Holographic Badge - AI Core Status */}
      <div className="absolute top-4 left-4 anim-float" style={{ zIndex: 10 }}>
        <div className="glass-card px-3.5 py-2.5 flex items-center gap-2.5 border-amber-500/20 backdrop-blur-xl bg-slate-950/70 shadow-lg shadow-amber-500/10">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-300">Neural Core v3.2</p>
            </div>
            <p className="text-xs font-bold text-white">Gemini 2.5 Pro Live</p>
          </div>
        </div>
      </div>

      {/* Floating Holographic Mini Card - Tasks Completion */}
      <div className="absolute -left-2 bottom-20 anim-float-delayed" style={{ zIndex: 10 }}>
        <div className="glass-card px-3.5 py-2.5 flex items-center gap-2.5 border-emerald-500/20 backdrop-blur-xl bg-slate-950/70 shadow-lg shadow-emerald-500/10">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono">Today's Focus</p>
            <p className="text-xs font-bold text-emerald-400">8 / 8 Done (100%)</p>
          </div>
        </div>
      </div>

      {/* Floating Holographic Mini Card - Spatial Ledger */}
      <div className="absolute -right-2 top-24 anim-float" style={{ zIndex: 10, animationDelay: '1.2s' }}>
        <div className="glass-card px-3.5 py-2.5 flex items-center gap-2.5 border-cyan-500/20 backdrop-blur-xl bg-slate-950/70 shadow-lg shadow-cyan-500/10">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono">PostgreSQL RLS</p>
            <p className="text-xs font-bold text-white">Strict Isolated</p>
          </div>
        </div>
      </div>

      {/* Interactive 3D drag hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pointer-events-none backdrop-blur-sm">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Drag to rotate 3D crystal</span>
      </div>
    </div>
  </div>
);

// ── Feature Card with 3D Specular Tilt ──────────────────────────────────────
const FeatureCard: React.FC<{
  icon: React.FC<any>; title: string; desc: string; color: string; accent: string;
}> = ({ icon: Icon, title, desc, color, accent }) => (
  <ThreeTiltCard tiltMaxAngle={12} glareOpacity={0.25} className="h-full">
    <div className="glass-card p-6 relative overflow-hidden group h-full flex flex-col">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20
        transition-opacity duration-500 rounded-full ${color}`}
        style={{ transform: 'translate(30%, -30%)' }} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 border ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{title}</h3>
      <p className="text-[13px] text-slate-400 leading-relaxed flex-1">{desc}</p>
    </div>
  </ThreeTiltCard>
);

// ── Main Landing Page ────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const features = [
    { icon: CheckSquare, title: 'Smart Task Management', color: 'bg-amber-500',   accent: 'border-amber-500/20 bg-amber-500/8 text-amber-400',
      desc: 'Prioritize with AI logic. Filter by priority, status and due date. One-click Eisenhower matrix sorting.' },
    { icon: FileText,   title: 'AI-Powered Notes',      color: 'bg-blue-500',    accent: 'border-blue-500/20 bg-blue-500/8 text-blue-400',
      desc: 'Capture thoughts and meeting minutes. Hit Summarize to extract key takeaways instantly via Gemini.' },
    { icon: DollarSign, title: 'Expense Intelligence',  color: 'bg-emerald-500', accent: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400',
      desc: 'Track spending across categories. Get dynamic AI budget alerts based on your real transactions.' },
    { icon: FolderLock, title: 'Document Intelligence', color: 'bg-purple-500',  accent: 'border-purple-500/20 bg-purple-500/8 text-purple-400',
      desc: 'Upload contracts and reports. Ask questions directly about your documents without manual searching.' },
    { icon: BrainCircuit, title: 'Database-Aware AI',   color: 'bg-amber-500',   accent: 'border-amber-500/20 bg-amber-500/8 text-amber-400',
      desc: 'The chatbot connects directly to your tasks, expenses, notes, and documents — no hallucinations.' },
    { icon: Shield,     title: 'Supabase RLS Security', color: 'bg-slate-500',   accent: 'border-slate-500/20 bg-slate-500/8 text-slate-400',
      desc: 'Row Level Security ensures your private data is visible only to you — even at the database level.' },
  ];

  const steps = [
    { num: '01', title: 'Add Your Data',     desc: 'Create tasks, log expenses, write notes, upload documents.',       color: 'text-amber-400' },
    { num: '02', title: 'LifeDesk Indexes',  desc: 'Structures and secures everything in Supabase PostgreSQL.',         color: 'text-blue-400' },
    { num: '03', title: 'Cloud Persisted',   desc: 'Available across all sessions with real-time Row Level Security.',  color: 'text-emerald-400' },
    { num: '04', title: 'AI Synthesizes',    desc: 'Gemini delivers daily briefings and answers queries precisely.',    color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 overflow-x-hidden">
      {/* dot texture overlay */}
      <div className="fixed inset-0 dot-texture opacity-100 pointer-events-none z-0" />

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#07080a]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-lg bg-amber-500/30 blur-sm" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600
                flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
            </div>
            <span className="text-base font-extrabold text-white tracking-tight">
              LifeDesk
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400
                border border-amber-500/25 font-bold">AI</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features',     action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'AI Assistant', action: () => document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'How It Works', action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                {label}
              </button>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onNavigate('login')}
              className="btn-ghost text-sm py-2">
              Login
            </button>
            <button onClick={() => onNavigate('register')}
              className="btn-primary text-sm py-2">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#07080a]/98 border-b border-white/5 px-4 py-4 space-y-2">
            {['Features', 'How It Works'].map(l => (
              <button key={l} onClick={() => setMenuOpen(false)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5">{l}</button>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <button onClick={() => onNavigate('login')} className="btn-ghost w-full justify-center">Login</button>
              <button onClick={() => onNavigate('register')} className="btn-primary w-full justify-center">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        {/* Ambient glow behind hero */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] blur-[140px] opacity-15
          bg-amber-500 rounded-full pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-amber-500/8 border border-amber-500/20 text-xs font-bold uppercase tracking-widest text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 anim-pulse-glow" />
              AI-Powered Personal Workspace
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                <span className="text-white">Your Life.</span><br />
                <span className="gradient-text-static">Organized by AI.</span>
              </h1>
            </div>

            {/* Supporting text */}
            <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
              LifeDesk AI combines tasks, notes, expenses and documents in one
              workspace — with a database-aware AI that answers questions about
              <em className="text-slate-400 not-italic"> your actual data</em>, never guessing.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => onNavigate('register')} className="btn-primary text-base px-8 py-3.5">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onNavigate('login')} className="btn-ghost text-base px-8 py-3.5">
                <Bot className="w-4 h-4 text-amber-500" /> Explore LifeDesk
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              {[
                { icon: Shield,   label: 'Row Level Security' },
                { icon: Database, label: 'Supabase PostgreSQL' },
                { icon: BrainCircuit, label: 'Gemini AI' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-amber-500/50" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="hidden lg:block">
            <HeroVisual />
          </div>
        </div>

        {/* Mobile hero visual */}
        <div className="lg:hidden mt-12">
          <HeroVisual />
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Everything You Need</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Five Modules. One Intelligent OS.</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Engineered for everyday clarity, powered by Gemini AI.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── AI SECTION ─────────────────────────────────────────── */}
      <section id="ai-section" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-3xl overflow-hidden">
            {/* Top accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: copy */}
              <div className="p-10 border-r border-white/5 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20
                  flex items-center justify-center anim-pulse-glow">
                  <BrainCircuit className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Database-Aware AI Assistant</h3>
                <p className="text-slate-600 leading-relaxed">
                  When you ask &quot;How much did I spend on Food this month?&quot; — the AI retrieves
                  your actual expense records, computes the exact total, and answers precisely.
                  No hallucinations. No guessing.
                </p>
                <div className="space-y-2">
                  {[
                    'What tasks are pending today?',
                    'Summarize my recent notes',
                    'What should I focus on?',
                    'How much did I spend this month?',
                  ].map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-slate-400 font-mono text-xs">{p}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => onNavigate('register')} className="btn-primary">
                  Try AI Assistant <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right: chat mockup */}
              <div className="p-6 bg-white/[0.01] space-y-3">
                <div id="ai-section-chat" />
                {[
                  { role: 'user', text: 'How much did I spend this month?' },
                  { role: 'ai',   text: 'Based on your 14 expense records, your total spend this month is **$842.50**. Highest category: Food ($320 · 38%).' },
                  { role: 'user', text: 'What are my high-priority tasks?' },
                  { role: 'ai',   text: '**2 high-priority tasks** need attention:\n1. Finish project report — Due today\n2. Team standup at 10am — Scheduled' },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}>
                    {m.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600
                        flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                      </div>
                    )}
                    <div className={`max-w-xs px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.role === 'user' ? 'msg-user' : 'msg-ai'
                    }`}>
                      {m.text.split('\n').map((line, li) => (
                        <p key={li} dangerouslySetInnerHTML={{
                          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Intelligent Data Flow</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">How LifeDesk AI Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.num} className="glass-card p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-5xl font-black text-white/[0.03] select-none">{s.num}</div>
                <p className={`text-[11px] font-bold font-mono uppercase tracking-widest mb-3 ${s.color}`}>{s.num}</p>
                <h4 className="text-sm font-bold text-white mb-2">{s.title}</h4>
                <p className="text-[13px] text-slate-600 leading-relaxed">{s.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-white/10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 z-10 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-96 h-32 blur-[80px] opacity-20 bg-amber-500 rounded-full" />
            <h2 className="relative text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to take control<br />of your daily life?
            </h2>
          </div>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            Join LifeDesk AI and start organizing your tasks, notes, and finances
            with real intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => onNavigate('register')} className="btn-primary text-base px-10 py-4">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('login')} className="btn-ghost text-base px-10 py-4">
              Sign In to Workspace
            </button>
          </div>
          {onOpenSupabaseModal && (
            <button onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-amber-400 transition-colors">
              <Database className="w-3.5 h-3.5" />
              View Supabase Schema & Connect
            </button>
          )}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-black" />
            </div>
            <span className="text-sm font-bold text-white">LifeDesk AI</span>
          </div>
          <p className="text-xs text-slate-700">
            Built with Supabase, Gemini AI, React & TypeScript · © {new Date().getFullYear()} LifeDesk AI
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <button onClick={() => onNavigate('login')} className="hover:text-slate-400 transition-colors">Login</button>
            <button onClick={() => onNavigate('register')} className="hover:text-slate-400 transition-colors">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
