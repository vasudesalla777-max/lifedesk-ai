import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Expense, Task, ExpenseCategory } from '../../types';
import { CATEGORY_COLORS } from '../expenses/ExpenseCharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, ArrowRight, DollarSign, Calendar } from 'lucide-react';

interface DashboardChartsProps {
  expenses: Expense[];
  tasks: Task[];
  onNavigateToExpenses: () => void;
  openNewExpenseModal?: () => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  expenses,
  tasks,
  onNavigateToExpenses,
  openNewExpenseModal,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'trend' | 'tasks'>('categories');

  // Category breakdown calculation
  const categoryData = useMemo(() => {
    const map: Record<string, { value: number; count: number }> = {};
    let total = 0;

    expenses.forEach((e) => {
      const amt = Number(e.amount || 0);
      if (!map[e.category]) {
        map[e.category] = { value: 0, count: 0 };
      }
      map[e.category].value += amt;
      map[e.category].count += 1;
      total += amt;
    });

    return Object.entries(map)
      .map(([cat, data]) => ({
        name: cat as ExpenseCategory,
        value: Number(data.value.toFixed(2)),
        percentage: total > 0 ? (data.value / total) * 100 : 0,
        count: data.count,
        color: CATEGORY_COLORS[cat as ExpenseCategory] || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalSpend = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [expenses]);

  // Timeline Trend (Last 7 active days or sorted chronological points)
  const timelineData = useMemo(() => {
    const dateMap: Record<string, { amount: number; count: number }> = {};

    expenses.forEach((e) => {
      const d = e.expense_date || e.created_at.split('T')[0];
      if (!dateMap[d]) {
        dateMap[d] = { amount: 0, count: 0 };
      }
      dateMap[d].amount += Number(e.amount || 0);
      dateMap[d].count += 1;
    });

    return Object.keys(dateMap)
      .sort()
      .slice(-10) // last 10 dates with activity
      .map((d) => {
        const parts = d.split('-');
        const displayDate =
          parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
        return {
          date: d,
          displayDate,
          amount: Number(dateMap[d].amount.toFixed(2)),
          count: dateMap[d].count,
        };
      });
  }, [expenses]);

  // Task Priority distribution
  const taskPriorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach((t) => {
      if (t.priority in counts) {
        counts[t.priority as keyof typeof counts]++;
      }
    });
    return [
      { name: 'High', count: counts.High, color: '#EF4444' },
      { name: 'Medium', count: counts.Medium, color: '#F59E0B' },
      { name: 'Low', count: counts.Low, color: '#3B82F6' },
    ];
  }, [tasks]);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Financial & Workflow Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual metrics synthesized from your authentic Supabase database records
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Category Share</span>
          </button>
          <button
            onClick={() => setActiveTab('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Spend Velocity</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
            <span>Task Priorities</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {activeTab === 'categories' && (
        <div>
          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <DollarSign className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs">No expense records found to generate category charts.</p>
              {openNewExpenseModal && (
                <button
                  onClick={openNewExpenseModal}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  Log your first expense
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-3 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {categoryData.map((entry) => (
                        <Cell
                          key={`dashboard-cat-${entry.name}`}
                          fill={entry.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `$${Number(val).toFixed(2)} (${Number(item.payload.percentage).toFixed(1)}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        borderColor: '#334155',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recorded Spend
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ${totalSpend.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Category Legend & Ratios */}
              <div className="md:col-span-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                {categoryData.slice(0, 5).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${item.value.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                        ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trend' && (
        <div className="h-64 w-full">
          {timelineData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center">
              <Calendar className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-700" />
              <p>No historical spend data recorded yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashSpendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    borderColor: '#334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#dashSpendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskPriorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(val: any) => [`${val} tasks`, 'Count']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '0.75rem',
                  borderColor: '#334155',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {taskPriorityData.map((entry) => (
                  <Cell key={`bar-${entry.name}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Showing real-time authenticated ledger data
        </span>
        <button
          onClick={onNavigateToExpenses}
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          <span>Open Full Expense Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
