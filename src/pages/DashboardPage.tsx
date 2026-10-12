import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PageView, Task } from '../types';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { CATEGORY_COLORS } from '../components/expenses/ExpenseCharts';
import { ThreeMyDayProgressRing } from '../components/3d/ThreeMyDayProgressRing';
import { ThreeTiltCard } from '../components/3d/ThreeTiltCard';
import {
  CheckSquare, Clock, CheckCircle2, TrendingUp, Plus,
  Calendar, Sparkles, ArrowRight, DollarSign, Tag, Receipt, Activity,
  Settings, BarChart3, Zap, AlertTriangle, ChevronRight, Loader2,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageView) => void;
  openNewTaskModal: () => void;
  openNewExpenseModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate, openNewTaskModal, openNewExpenseModal,
}) => {
  const { user, isCloudConnected } = useAuth();
  const {
    tasks, toggleTask, addTask, expenses,
    totalMonthlySpend, totalAllTimeSpend, highestSpendingCategory,
    suggestTasksAI,
  } = useData();

  const [activeTaskTab, setActiveTaskTab] = useState<'myday' | 'priority' | 'upcoming' | 'overdue'>('myday');
  const [aiSuggestions, setAiSuggestions] = useState<Array<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>>([]);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormatted = useMemo(() =>
    new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
  []);

  // Task segmentations
  const pendingTasks   = useMemo(() => tasks.filter(t => t.status !== 'Completed' && !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'Completed' || t.completed), [tasks]);
  const highPriority   = useMemo(() => tasks.filter(t => t.priority === 'High' && t.status !== 'Completed' && !t.completed).length, [tasks]);
  const completionRate = useMemo(() => tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100), [tasks, completedTasks]);

  // Today's tasks (due today, daily recurring, or active)
  const todayTasks = useMemo(() => {
    return tasks.filter(t =>
      t.due_date === todayDate ||
      t.recurrence === 'Daily' ||
      (!t.due_date && t.status !== 'Completed' && !t.completed)
    );
  }, [tasks, todayDate]);

  const todayCompleted = useMemo(() => todayTasks.filter(t => t.status === 'Completed' || t.completed), [todayTasks]);
  const todayPercent = useMemo(() => todayTasks.length === 0 ? 100 : Math.round((todayCompleted.length / todayTasks.length) * 100), [todayTasks, todayCompleted]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'Completed' && !t.completed && t.due_date && t.due_date < todayDate);
  }, [tasks, todayDate]);

  // Upcoming tasks
  const upcomingTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'Completed' && !t.completed && t.due_date && t.due_date > todayDate);
  }, [tasks, todayDate]);

  // Priority tasks
  const priorityTasks = useMemo(() =>
    [...tasks].sort((a, b) => ({ High:0, Medium:1, Low:2 }[a.priority] ?? 2) - ({ High:0, Medium:1, Low:2 }[b.priority] ?? 2)).slice(0, 6),
  [tasks]);

  // Filtered task list by tab
  const displayedTasks = useMemo(() => {
    switch (activeTaskTab) {
      case 'myday':
        return todayTasks.slice(0, 6);
      case 'priority':
        return priorityTasks;
      case 'upcoming':
        return upcomingTasks.slice(0, 6);
      case 'overdue':
        return overdueTasks;
      default:
        return todayTasks.slice(0, 6);
    }
  }, [activeTaskTab, todayTasks, priorityTasks, upcomingTasks, overdueTasks]);

  const recentExpenses = useMemo(() =>
    [...expenses].sort((a,b) => b.expense_date.localeCompare(a.expense_date)).slice(0,4),
  [expenses]);

  const handleFetchSuggestions = async () => {
    setIsLoadingAiSuggestions(true);
    try {
      const suggestions = await suggestTasksAI();
      setAiSuggestions(suggestions.slice(0, 3));
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  const handleAddAiSuggestion = async (s: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addTask(s);
    setAiSuggestions(prev => prev.filter(item => item.title !== s.title));
  };

  const metrics = [
    { label: 'Active Tasks',       value: pendingTasks.length,               sub: `${highPriority} high priority`,           icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10', border: 'border-amber-500/15', page: 'tasks' as PageView },
    { label: 'Completed',          value: completedTasks.length,             sub: `${completionRate}% overall rate`,          icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', page: 'tasks' as PageView },
    { label: "This Month's Spend", value: `$${totalMonthlySpend.toFixed(2)}`, sub: `$${totalAllTimeSpend.toFixed(0)} all-time`, icon: DollarSign,   color: 'text-blue-400',    bg: 'bg-blue-500/10', border: 'border-blue-500/15', page: 'expenses' as PageView },
    { label: 'Top Category',       value: highestSpendingCategory.category,  sub: `$${highestSpendingCategory.amount.toFixed(2)} · ${highestSpendingCategory.percentage.toFixed(0)}%`, icon: Tag, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15', page: 'expenses' as PageView },
  ];

  return (
    <div className="space-y-6 pb-14">
      {/* ── Welcome Banner with 3D MyDay Progress Ring ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8 backdrop-blur-xl bg-slate-900/80 shadow-2xl">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 blur-[90px] opacity-20 bg-gradient-to-br from-amber-500 to-emerald-500 rounded-full pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500/80">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayFormatted}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400">
                {isCloudConnected ? '⚡ Supabase Live' : '📦 Local Engine'}
              </span>
              {overdueTasks.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3 h-3" /> {overdueTasks.length} Overdue
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {greeting}, {firstName}
              <span className="ml-2 text-3xl">👋</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your 3D neural cockpit is active. Today you have{' '}
              <span className="text-amber-400 font-semibold">{todayTasks.length - todayCompleted.length} pending items</span> in My Day and{' '}
              <span className="text-emerald-400 font-semibold">{todayCompleted.length} completed</span>.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={openNewTaskModal}
                className="btn-primary text-xs py-2 px-4 shadow-lg shadow-amber-500/15"
              >
                <Plus className="w-3.5 h-3.5" /> Quick Add Task
              </button>
              {openNewExpenseModal && (
                <button
                  onClick={openNewExpenseModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30
                    bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Log Expense
                </button>
              )}
              <button
                onClick={() => onNavigate('ai-assistant')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-500/30
                  bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" /> Consult AI
              </button>
            </div>
          </div>

          {/* 3D Real WebGL MyDay Progress Centerpiece */}
          <div className="flex items-center justify-center lg:justify-end shrink-0 py-2">
            <div className="relative flex flex-col items-center">
              <ThreeMyDayProgressRing
                completed={todayCompleted.length}
                total={todayTasks.length}
                percentage={todayPercent}
                size={180}
              />
              <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>My Day Velocity: {todayPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards with 3D Tilt ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <ThreeTiltCard key={m.label} tiltMaxAngle={10} glareOpacity={0.2} onClick={() => onNavigate(m.page)}>
            <div className="stat-card cursor-pointer h-full backdrop-blur-md bg-slate-900/60 border border-white/8 hover:border-amber-500/30 transition-all p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{m.label}</span>
                <div className={`p-2 rounded-xl ${m.bg} border ${m.border}`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-black ${m.color} truncate`}>{m.value}</div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">{m.sub}</p>
            </div>
          </ThreeTiltCard>
        ))}
      </div>

      {/* ── Task Management Showcase ── */}
      <div className="glass-card p-6 border border-white/8 backdrop-blur-xl bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Focus & Action Items</h2>
              <p className="text-xs text-slate-400">Manage what needs your immediate attention</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Task Tabs */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-medium">
              <button
                onClick={() => setActiveTaskTab('myday')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTaskTab === 'myday'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                My Day ({todayTasks.length})
              </button>
              <button
                onClick={() => setActiveTaskTab('priority')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTaskTab === 'priority'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => setActiveTaskTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTaskTab === 'upcoming'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Upcoming ({upcomingTasks.length})
              </button>
              {overdueTasks.length > 0 && (
                <button
                  onClick={() => setActiveTaskTab('overdue')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTaskTab === 'overdue'
                      ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20'
                      : 'text-red-400 hover:text-red-300'
                  }`}
                >
                  Overdue ({overdueTasks.length})
                </button>
              )}
            </div>

            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 ml-2"
            >
              Full Workspace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Task Suggestion Bar */}
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">AI Prioritization Copilot</p>
              <p className="text-[11px] text-slate-400">Generate high-impact action recommendations based on your goals</p>
            </div>
          </div>
          <button
            onClick={handleFetchSuggestions}
            disabled={isLoadingAiSuggestions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 text-xs font-semibold transition-all shrink-0 self-start sm:self-auto"
          >
            {isLoadingAiSuggestions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isLoadingAiSuggestions ? 'Analyzing...' : 'Generate AI Suggestions'}
          </button>
        </div>

        {/* AI Suggestions Cards (if any) */}
        {aiSuggestions.length > 0 && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/30 space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Suggested for you:
            </p>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {aiSuggestions.map((sug, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/[0.03] border border-white/8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {sug.category || 'Focus'}
                    </span>
                    <p className="text-xs font-bold text-white mt-1.5 line-clamp-2">{sug.title}</p>
                  </div>
                  <button
                    onClick={() => handleAddAiSuggestion(sug)}
                    className="mt-3 w-full py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add to Tasks
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-2.5">
          {displayedTasks.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-400/40" />
              <p className="text-sm font-semibold text-slate-300">
                {activeTaskTab === 'overdue' ? 'No overdue items! Great job staying on track.' : 'All caught up in this view!'}
              </p>
              <button
                onClick={openNewTaskModal}
                className="px-4 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-colors"
              >
                + Add New Task
              </button>
            </div>
          ) : (
            displayedTasks.map(task => {
              const isDone = task.status === 'Completed' || task.completed;
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`chip ${
                          task.priority === 'High' ? 'chip-red' :
                          task.priority === 'Medium' ? 'chip-amber' : 'bg-white/5 text-slate-400 border-white/8'
                        }`}>
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">
                            {task.category}
                          </span>
                        )}
                        <span className={`text-[11px] font-mono ${
                          task.due_date && task.due_date < todayDate && !isDone
                            ? 'text-red-400 font-bold'
                            : 'text-slate-400'
                        }`}>
                          {task.due_date ? `Due ${task.due_date}` : 'No deadline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium shrink-0 ${
                    isDone ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    task.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    {isDone ? 'Completed' : task.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Charts ── */}
      <DashboardCharts
        expenses={expenses}
        tasks={tasks}
        onNavigateToExpenses={() => onNavigate('expenses')}
        openNewExpenseModal={openNewExpenseModal}
      />

      {/* ── Secondary Grid (Expenses & Shortcuts) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/8 backdrop-blur-xl bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              All Expenses <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="py-8 text-center">
              <DollarSign className="w-6 h-6 mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-500">No expenses logged yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map(exp => {
                const color = CATEGORY_COLORS[exp.category] || '#64748B';
                return (
                  <div
                    key={exp.id}
                    onClick={() => onNavigate('expenses')}
                    className="flex items-center justify-between p-3 rounded-xl
                      bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 cursor-pointer transition-all group"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                        {exp.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[10px] text-slate-400">{exp.category} · {exp.expense_date}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 shrink-0">
                      ${Number(exp.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shortcuts & Quick Actions */}
        <div className="space-y-5">
          <div className="glass-card p-5 border border-white/8 backdrop-blur-xl bg-slate-900/60">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> Quick Cockpit Controls
            </h3>
            <div className="space-y-2">
              {[
                { Icon: Plus,      label: 'Create Task',    sub: 'Add action item',        color: 'text-amber-400', bg: 'bg-amber-500/10', action: openNewTaskModal },
                { Icon: DollarSign, label: 'Record Expense', sub: 'Log purchase receipt',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', action: openNewExpenseModal },
                { Icon: BarChart3, label: 'Expense Ledger', sub: 'Category analytics',     color: 'text-purple-400', bg: 'bg-purple-500/10', action: () => onNavigate('expenses') },
                { Icon: Settings,  label: 'Settings',       sub: 'Theme, sync & keys',     color: 'text-slate-400', bg: 'bg-white/5',      action: () => onNavigate('settings') },
              ].filter(a => !!a.action).map(({ Icon, label, sub, color, bg, action }) => (
                <button
                  key={label}
                  onClick={action as () => void}
                  className="w-full flex items-center justify-between p-3 rounded-xl
                    bg-white/[0.02] border border-white/5 hover:border-amber-500/20 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</p>
                      <p className="text-[10px] text-slate-500">{sub}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Cockpit Box */}
          <ThreeTiltCard tiltMaxAngle={8} glareOpacity={0.25}>
            <div className="relative overflow-hidden glass-card p-5 border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-24 blur-[60px] opacity-20 bg-amber-500 pointer-events-none" />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-sm font-bold text-white mb-1">AI Life Companion</p>
                <p className="text-xs text-slate-400 mb-4">Chat with the 3D grounded AI orb for task breakdowns, document query, and spending analysis.</p>
                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="btn-primary text-xs py-2 w-full flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Launch 3D AI Orb
                </button>
              </div>
            </div>
          </ThreeTiltCard>
        </div>
      </div>
    </div>
  );
};
