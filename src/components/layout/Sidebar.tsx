import React from 'react';
import { PageView } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, FileText, DollarSign,
  FolderLock, Sparkles, User, Settings, X, LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage, setCurrentPage, isMobileOpen, closeMobileSidebar,
}) => {
  const { tasks, notes, documents } = useData();
  const { user, logout } = useAuth();

  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;

  const navItems: {
    id: PageView; label: string; icon: React.FC<any>;
    badge?: number | string; isAI?: boolean;
  }[] = [
    { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'tasks',        label: 'Tasks',         icon: CheckSquare, badge: pendingCount || undefined },
    { id: 'notes',        label: 'Notes',         icon: FileText, badge: notes.length || undefined },
    { id: 'expenses',     label: 'Expenses',      icon: DollarSign },
    { id: 'documents',    label: 'Documents',     icon: FolderLock, badge: documents.length || undefined },
    { id: 'ai-assistant', label: 'AI Assistant',  icon: Sparkles, isAI: true, badge: 'PRO' },
    { id: 'profile',      label: 'Profile',       icon: User },
    { id: 'settings',     label: 'Settings',      icon: Settings },
  ];

  const handleNav = (page: PageView) => {
    setCurrentPage(page);
    closeMobileSidebar();
  };

  const content = (
    <div className="flex flex-col h-full sidebar select-none">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
        <button onClick={() => handleNav('dashboard')} className="flex items-center gap-3 group">
          {/* Logo orb */}
          <div className="relative w-8 h-8 shrink-0">
            <div className="absolute inset-0 rounded-lg bg-amber-500/20 blur-sm" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">LifeDesk</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 font-bold tracking-wide">AI</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">Personal AI OS</p>
          </div>
        </button>
        <button onClick={closeMobileSidebar} className="md:hidden p-1 rounded-lg text-slate-600 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 no-scrollbar">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-700">Workspace</p>

        {navItems.map(item => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          if (item.isAI) {
            return (
              <div key={item.id} className="py-1">
                <button
                  onClick={() => handleNav(item.id)}
                  className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 overflow-hidden group ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      : 'text-slate-500 border border-white/5 hover:border-amber-500/20 hover:text-amber-400 hover:bg-amber-500/8'
                  }`}
                >
                  {/* Shimmer */}
                  {!isActive && (
                    <span className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: '50%', transform: 'translateX(-50%)' }} />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-600 group-hover:text-amber-400'}`} />
                      <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-amber-400 opacity-60" />
                        <span className="relative rounded-full h-1.5 w-1.5 bg-amber-500" />
                      </span>
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider z-10 ${
                    isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-600'
                  }`}>{item.badge}</span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-slate-600'
                }`}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Hint Footer */}
      <div className="mx-3 mb-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 anim-pulse-glow" />
          <span className="text-[11px] font-semibold text-amber-400">Database-Aware RAG</span>
        </div>
        <p className="text-[10px] text-slate-600 leading-relaxed">
          AI retrieves strictly from your tasks, notes, and records.
        </p>
      </div>

      {/* User row */}
      {user && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
          <button onClick={() => handleNav('profile')} className="flex items-center gap-2.5 min-w-0 group">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-xs font-bold text-amber-400 group-hover:border-amber-400/60 transition-colors overflow-hidden">
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : (user.full_name?.charAt(0) || 'U')
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">{user.full_name}</p>
              <p className="text-[10px] text-slate-700 truncate">{user.email}</p>
            </div>
          </button>
          <button onClick={() => logout()} title="Sign Out"
            className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 z-40">{content}</aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={closeMobileSidebar} />
          <div className="relative w-64 h-full z-10">{content}</div>
        </div>
      )}
    </>
  );
};
