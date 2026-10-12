import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Trash2, Edit3, Sparkles, Filter,
  Search, Calendar, ArrowUp, Minus, ArrowDown, Repeat, Tag,
  Layers, CheckSquare, Zap, AlertCircle, X, ChevronRight, BookOpen,
  GraduationCap, Briefcase, User, HeartPulse, ShoppingBag, FolderKanban, MoreHorizontal,
  Flame, Snowflake
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Task, Priority, TaskCategory, TaskRecurrence } from '../types';
import { ThreeMyDayProgressRing } from '../components/3d/ThreeMyDayProgressRing';
import { ThreeTiltCard } from '../components/3d/ThreeTiltCard';
import confetti from 'canvas-confetti';

interface TasksPageProps {
  isNewTaskModalOpen?: boolean;
  setIsNewTaskModalOpen?: (open: boolean) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Study',
  'College',
  'Career',
  'Personal',
  'Health & Routine',
  'Shopping',
  'Projects',
  'Winter Arc',
  'Other',
];

const CATEGORY_META: Record<TaskCategory, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }> = {
  Study: { label: 'Study', icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  College: { label: 'College', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  Career: { label: 'Career', icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  Personal: { label: 'Personal', icon: User, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Health & Routine': { label: 'Health & Routine', icon: HeartPulse, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Shopping: { label: 'Shopping', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  Projects: { label: 'Projects', icon: FolderKanban, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'Winter Arc': { label: 'Winter Arc', icon: Snowflake, color: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-400/30' },
  Other: { label: 'Other', icon: MoreHorizontal, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const PRIORITY_META: Record<Priority, { label: string; color: string; badge: string; icon: React.FC<{ className?: string }> }> = {
  High: { label: 'High', color: 'text-red-400', badge: 'bg-red-500/10 border-red-500/30 text-red-400', icon: ArrowUp },
  Medium: { label: 'Medium', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: Minus },
  Low: { label: 'Low', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: ArrowDown },
};

export const TasksPage: React.FC<TasksPageProps> = ({
  isNewTaskModalOpen = false,
  setIsNewTaskModalOpen,
}) => {
  const { user } = useAuth();
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    suggestTasksAI,
    createTaskFromNaturalLanguage,
    prioritizeTasksAI,
  } = useData();

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'my-day' | 'all' | 'upcoming' | 'completed' | 'calendar'>('my-day');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Assistant Natural Language Input
  const [nlInput, setNlInput] = useState('');
  const [isNlProcessing, setIsNlProcessing] = useState(false);

  // AI Task Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<Array<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>>([]);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiPrioritizationText, setAiPrioritizationText] = useState<string | null>(null);

  // Task Creation / Editing Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<TaskCategory>('Study');
  const [formPriority, setFormPriority] = useState<Priority>('Medium');
  const [formDueDate, setFormDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formRecurrence, setFormRecurrence] = useState<TaskRecurrence>('None');

  // Sync with external modal trigger from navbar
  useEffect(() => {
    if (isNewTaskModalOpen) {
      handleOpenCreate();
      setIsNewTaskModalOpen?.(false);
    }
  }, [isNewTaskModalOpen]);

  // Greeting & Date
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filter calculations
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.due_date) return true;
      return t.due_date === todayISO || t.recurrence === 'Daily';
    });
  }, [tasks, todayISO]);

  const completedToday = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'Completed' || t.completed).length;
  }, [todayTasks]);

  const totalToday = todayTasks.length;
  const todayPercentage = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  // Filtered Task List based on current view tab
  const displayedTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        const matchCat = (t.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false;
      }

      // 3. Priority filter
      if (selectedPriority !== 'All' && t.priority !== selectedPriority) {
        return false;
      }

      // 4. Tab filters
      const isCompleted = t.status === 'Completed' || t.completed;
      if (activeTab === 'my-day') {
        if (t.recurrence === 'Daily') return true;
        return !t.due_date || t.due_date === todayISO;
      }
      if (activeTab === 'upcoming') {
        return !isCompleted && t.due_date && t.due_date > todayISO;
      }
      if (activeTab === 'completed') {
        return isCompleted;
      }
      return true; // 'all' and 'calendar'
    });
  }, [tasks, activeTab, selectedCategory, selectedPriority, searchQuery, todayISO]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Study');
    setFormPriority('Medium');
    setFormDueDate(todayISO);
    setFormRecurrence('None');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormCategory(task.category || 'Other');
    setFormPriority(task.priority);
    setFormDueDate(task.due_date || todayISO);
    setFormRecurrence(task.recurrence || 'None');
    setIsModalOpen(true);
  };

  // Save Task Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        priority: formPriority,
        due_date: formDueDate,
        recurrence: formRecurrence,
      });
    } else {
      await addTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        priority: formPriority,
        status: 'Pending',
        due_date: formDueDate,
        recurrence: formRecurrence,
        completed: false,
      });
    }
    setIsModalOpen(false);
  };

  // Quick Natural Language Submission
  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim() || isNlProcessing) return;

    setIsNlProcessing(true);
    try {
      await createTaskFromNaturalLanguage(nlInput.trim());
      setNlInput('');
    } finally {
      setIsNlProcessing(false);
    }
  };

  // Fetch AI Task Suggestions
  const handleFetchAiSuggestions = async () => {
    setIsAiSuggesting(true);
    try {
      const suggestions = await suggestTasksAI();
      setAiSuggestions(suggestions);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  // 1-Click Add from AI suggestion
  const handleAddAiSuggestion = async (suggestion: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addTask(suggestion);
    setAiSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title));
  };

  // Dismiss AI suggestion
  const handleDismissAiSuggestion = (title: string) => {
    setAiSuggestions((prev) => prev.filter((s) => s.title !== title));
  };

  // AI Prioritization Breakdown
  const handleRequestPrioritization = async () => {
    const text = await prioritizeTasksAI();
    setAiPrioritizationText(text);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. "MY DAY" SECTION WITH 3D PROGRESS VISUALIZATION          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8 bg-[#0b0c10]/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/40">
        {/* Futuristic Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-48 blur-[100px] opacity-25 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-40 blur-[90px] opacity-20 bg-indigo-600 pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Greeting, Date, & Metrics */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Flame className="w-3.5 h-3.5 fill-emerald-400" />
                MY DAY COMMAND
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{todayFormatted}</span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {greeting}, {user?.full_name?.split(' ')[0] || 'Member'}
              </h1>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-xl">
                Here is your live daily productivity blueprint. Focus on high-impact milestones,
                maintain study rhythms, and complete today's essential tasks.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled Today</p>
                <p className="text-2xl font-black text-white mt-0.5">{totalToday}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tasks on agenda</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">{completedToday}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Checked off</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Remaining</p>
                <p className="text-2xl font-black text-amber-400 mt-0.5">{Math.max(0, totalToday - completedToday)}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Pending focus</p>
              </div>
            </div>
          </div>

          {/* Right Column: Real 3D WebGL Torus Progress Ring */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center py-2">
            <ThreeMyDayProgressRing
              completed={completedToday}
              total={totalToday}
              percentage={todayPercentage}
              size={210}
            />
            <div className="text-center mt-2">
              <p className="text-xs font-semibold text-slate-300">
                {todayPercentage === 100
                  ? '🎉 All daily tasks completed! Exceptional momentum!'
                  : `${todayPercentage}% daily completion progress`}
              </p>
              <p className="text-[11px] text-slate-500">
                Interactive 3D WebGL Torus gauge with mouse perspective tilt
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. NATURAL LANGUAGE AI TASK CREATION BAR                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/50 p-4 sm:p-5 backdrop-blur-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Natural Language AI Task Creator
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Type naturally e.g. <span className="text-cyan-300 font-mono">"Tomorrow I need to complete my Java assignment"</span> or <span className="text-amber-300 font-mono">"Every Monday remind me to practice Python"</span>
            </p>
          </div>

          <form onSubmit={handleNlSubmit} className="flex items-center gap-2 flex-1 max-w-xl">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder="Tell LifeDesk AI what you need to do..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-all"
            />
            <button
              type="submit"
              disabled={isNlProcessing || !nlInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shrink-0 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              {isNlProcessing ? (
                <span className="flex items-center gap-1">Parsing...</span>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-black" /> Parse & Add
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. AI TASK SUGGESTIONS & STRATEGY PANEL                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFetchAiSuggestions}
            disabled={isAiSuggesting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            {isAiSuggesting ? 'Analyzing Schedule...' : 'AI Suggest Tasks'}
          </button>
          <button
            onClick={handleRequestPrioritization}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Eisenhower Matrix Prioritization
          </button>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Dynamic AI Suggested Tasks Pill Drawer (if generated) */}
      {aiSuggestions.length > 0 && (
        <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-950/20 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Suggested Daily Life Tasks (Click to Add or Dismiss)
            </span>
            <button
              onClick={() => setAiSuggestions([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {aiSuggestions.map((sug) => (
              <div
                key={sug.title}
                className="p-3 rounded-xl border border-white/5 bg-slate-900/60 flex flex-col justify-between gap-2 transition-all hover:border-violet-500/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      {sug.category}
                    </span>
                    <button
                      onClick={() => handleDismissAiSuggestion(sug.title)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1">{sug.title}</p>
                  {sug.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{sug.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleAddAiSuggestion(sug)}
                  className="w-full py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add to Tasks
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Prioritization Summary modal/drawer (if requested) */}
      {aiPrioritizationText && (
        <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md relative">
          <button
            onClick={() => setAiPrioritizationText(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              AI Prioritization Blueprint
            </span>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {aiPrioritizationText}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. TABS, SEARCH, CATEGORIES & FILTERS                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/5">
            {[
              { id: 'my-day', label: 'My Day', icon: Flame },
              { id: 'all', label: 'All Tasks', icon: Layers },
              { id: 'upcoming', label: 'Upcoming', icon: Clock },
              { id: 'completed', label: 'Completed', icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, categories..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all"
            />
          </div>
        </div>

        {/* 8 Categories Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-white text-black font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                  isSelected
                    ? `${meta.bg} ${meta.border} ${meta.color} font-bold shadow-md shadow-indigo-950/40`
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. 3D FLOATING TASK CARDS GRID                              */}
      {/* ─────────────────────────────────────────────────────────── */}
      {displayedTasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-white">No tasks match this filter</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try choosing a different category tab, clearing your search query, or creating a new task.
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn-primary text-xs py-2 px-4 mt-4 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTasks.map((task) => {
            const isDone = task.status === 'Completed' || task.completed;
            const cat = task.category || 'Other';
            const catMeta = CATEGORY_META[cat] || CATEGORY_META.Other;
            const CatIcon = catMeta.icon;
            const priMeta = PRIORITY_META[task.priority] || PRIORITY_META.Medium;
            const PriIcon = priMeta.icon;

            return (
              <ThreeTiltCard
                key={task.id}
                tiltMaxAngle={8}
                glareOpacity={0.15}
                className="group"
              >
                <div
                  className={`relative p-5 rounded-2xl border transition-all duration-300 h-full flex flex-col justify-between ${
                    isDone
                      ? 'bg-slate-950/60 border-white/5 opacity-70'
                      : 'bg-slate-900/80 border-white/10 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-950/20'
                  }`}
                  style={{ backdropFilter: 'blur(16px)' }}
                >
                  {/* Top Bar: Category & Priority Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${catMeta.bg} ${catMeta.border} ${catMeta.color}`}>
                        <CatIcon className="w-3 h-3" />
                        {cat}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${priMeta.badge}`}>
                          <PriIcon className="w-3 h-3" />
                          {task.priority}
                        </span>

                        {task.recurrence && task.recurrence !== 'None' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400">
                            <Repeat className="w-2.5 h-2.5" />
                            {task.recurrence}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Task Title & Checkbox */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 shrink-0 transition-transform active:scale-90 ${
                          isDone ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isDone ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-bold leading-snug tracking-tight transition-colors ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-cyan-200'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p
                            className={`text-xs mt-1.5 leading-relaxed line-clamp-3 ${
                              isDone ? 'text-slate-600' : 'text-slate-400'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Due Date & Action Controls */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{task.due_date || 'No due date'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Edit task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </ThreeTiltCard>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. CREATE / EDIT TASK MODAL                                 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-bold">
                <CheckSquare className="w-5 h-5 fill-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingTask ? 'Edit Task' : 'Create Daily Life Task'}
                </h3>
                <p className="text-xs text-slate-400">
                  Manage your schedule with priorities and categories
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Complete Java assignment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add specific details, links, or instructions..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recurrence
                  </label>
                  <select
                    value={formRecurrence}
                    onChange={(e) => setFormRecurrence(e.target.value as TaskRecurrence)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="None">None (One-time)</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5"
                >
                  {editingTask ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
