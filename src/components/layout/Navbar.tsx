import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PageView } from '../../types';
import {
  Menu, Sparkles, Plus, CheckSquare, FileText,
  DollarSign, User, LogOut, Settings as SettingsIcon,
  Database, Cloud, Sun, Moon, ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  toggleMobileSidebar: () => void;
  openNewTaskModal: () => void;
  openNewExpenseModal?: () => void;
  openNewNoteModal?: () => void;
  openSupabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setCurrentPage, toggleMobileSidebar,
  openNewTaskModal, openNewExpenseModal, openNewNoteModal, openSupabaseModal,
}) => {
  const { user, logout, isCloudConnected } = useAuth();
  const { isDarkMode, toggleTheme } = useData();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
      if (addRef.current && !addRef.current.contains(e.target as Node)) setIsQuickAddOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.full_name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/5 bg-[#07080a]/90 backdrop-blur-xl">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-white hover:bg-white/5 md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* AI quick-ask pill */}
          <button
            onClick={() => setCurrentPage('ai-assistant')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/8 border border-amber-500/15
              text-xs font-semibold text-amber-400 hover:bg-amber-500/15 transition-all group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>Ask LifeDesk AI…</span>
            <span className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] font-mono text-amber-500">
              RAG
            </span>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* DB status */}
          <button
            onClick={() => openSupabaseModal?.()}
            title={isCloudConnected ? 'Supabase live' : 'Local storage'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium
              bg-white/[0.03] border border-white/6 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isCloudConnected
              ? <><Cloud className="w-3.5 h-3.5 text-emerald-500" /><span>Supabase</span></>
              : <><Database className="w-3.5 h-3.5 text-amber-500" /><span>Local</span></>}
          </button>

          {/* Quick Add */}
          <div className="relative" ref={addRef}>
            <button
              onClick={() => setIsQuickAddOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black transition-all"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Quick Add</span>
            </button>

            {isQuickAddOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card p-1.5 z-50" style={{ borderRadius: 14 }}>
                {[
                  { Icon: CheckSquare, label: 'New Task',    color: 'text-amber-400',  action: () => { setIsQuickAddOpen(false); openNewTaskModal(); } },
                  { Icon: DollarSign, label: 'New Expense',  color: 'text-emerald-400', action: () => { setIsQuickAddOpen(false); openNewExpenseModal?.(); } },
                  { Icon: FileText,   label: 'New Note',     color: 'text-blue-400',   action: () => { setIsQuickAddOpen(false); openNewNoteModal?.(); } },
                ].map(({ Icon, label, color, action }) => (
                  <button key={label} onClick={action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400
                      hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                    <Icon className={`w-4 h-4 ${color}`} />{label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle theme">
            {isDarkMode
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4" />}
          </button>

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setIsUserMenuOpen(v => !v)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-amber-500/20 border border-amber-500/30
                flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : initials}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-300 max-w-[90px] truncate">
                {user?.full_name?.split(' ')[0] || 'Me'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-card p-2 z-50" style={{ borderRadius: 14 }}>
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
                </div>
                {[
                  { Icon: User,          label: 'Profile',          action: () => { setIsUserMenuOpen(false); setCurrentPage('profile'); } },
                  { Icon: SettingsIcon,  label: 'Settings',         action: () => { setIsUserMenuOpen(false); setCurrentPage('settings'); } },
                  { Icon: Database,      label: 'Database & RLS',   action: () => { setIsUserMenuOpen(false); openSupabaseModal?.(); } },
                ].map(({ Icon, label, action }) => (
                  <button key={label} onClick={action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400
                      hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left">
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
                <div className="my-1 border-t border-white/5" />
                <button
                  onClick={() => { setIsUserMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400
                    hover:bg-red-500/10 rounded-xl transition-colors text-left">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
