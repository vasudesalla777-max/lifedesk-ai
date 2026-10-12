import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { ExpenseCategory } from '../../types';

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#10B981', // emerald-500
  Rent: '#6366F1', // indigo-500
  Travel: '#06B6D4', // cyan-500
  Education: '#F59E0B', // amber-500
  Shopping: '#8B5CF6', // violet-500
  Bills: '#EF4444', // rose-500
  Entertainment: '#EC4899', // pink-500
  Other: '#64748B', // slate-500
};

interface CategoryDataPoint {
  name: ExpenseCategory;
  value: number;
  percentage: number;
  count: number;
  color: string;
}

interface ExpenseChartsProps {
  categoryData: CategoryDataPoint[];
  timelineData: { date: string; displayDate: string; amount: number; count: number }[];
  totalSpend: number;
}

// Custom tooltip for category pie chart
const CategoryTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-sm z-50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-bold text-white text-sm">{data.name}</span>
        </div>
        <div className="space-y-0.5 text-slate-300">
          <p className="font-semibold text-white text-base">${Number(data.value).toFixed(2)}</p>
          <p className="text-[11px] text-slate-400">
            {Number(data.percentage).toFixed(1)}% of total • {data.count} transaction{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for timeline charts
const TimelineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-sm z-50">
        <p className="text-slate-400 font-medium mb-1">{data.displayDate || label}</p>
        <p className="font-bold text-emerald-400 text-base">
          ${Number(payload[0].value).toFixed(2)}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {data.count} transaction{data.count !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export const CategoryDonutChart: React.FC<{
  data: CategoryDataPoint[];
  totalSpend: number;
}> = ({ data, totalSpend }) => {
  if (data.length === 0 || totalSpend === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 mb-3 flex items-center justify-center">
          $
        </div>
        <p className="font-medium text-slate-500 dark:text-slate-400">No expense distribution data</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Add transactions to view category share</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.color}
                stroke="transparent"
                className="cursor-pointer transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CategoryTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Central Total Metric */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Total
        </span>
        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          ${totalSpend.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

export const SpendingTimelineChart: React.FC<{
  data: { date: string; displayDate: string; amount: number; count: number }[];
}> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
        <p className="font-medium text-slate-500 dark:text-slate-400">No timeline data available</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Log expenses to see trends over time</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
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
          <Tooltip content={<TimelineTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#10B981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryBarChart: React.FC<{
  data: CategoryDataPoint[];
}> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
        <p className="font-medium text-slate-500 dark:text-slate-400">No category data</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
          <XAxis
            dataKey="name"
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
          <Tooltip content={<CategoryTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`bar-${entry.name}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
