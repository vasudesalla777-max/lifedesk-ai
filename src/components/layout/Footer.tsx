import React from 'react';
import { PageView } from '../../types';
import { Zap, Github, Twitter, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: PageView) => void;
  variant?: 'dark' | 'light' | 'auto';
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, variant = 'dark' }) => {
  const currentYear = new Date().getFullYear();

  const isDark = variant === 'dark';

  return (
    <footer
      className={`border-t transition-colors ${
        isDark
          ? 'bg-slate-950 border-slate-800 text-slate-400'
          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                LifeDesk <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-slate-600 dark:text-slate-400">
              Your personal life operating system. Designed to keep tasks, notes, documents, and everyday finances organized with grounded database-aware intelligence.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems operational</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RLS Protected</span>
              </span>
            </div>
          </div>

          {/* Navigation Column 1 - Product */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('tasks')}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left"
                >
                  Task Manager
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('notes')}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left"
                >
                  Smart Notes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('expenses')}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left"
                >
                  Expense Insights
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 - Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Technology
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5">
                <span>Supabase PostgreSQL</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>Google Gemini AI</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>React 18 + Vite</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>Tailwind CSS</span>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3 - Account & Auth */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Get Started
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.('login')}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left font-medium text-indigo-600 dark:text-indigo-400"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('register')}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left"
                >
                  Create Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left"
                >
                  Explore Demo
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} LifeDesk AI. Built for productivity and seamless everyday management.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
