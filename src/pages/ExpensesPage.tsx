import React, { useState, useMemo } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, Sparkles, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useData } from '../context/DataContext';
import type { Expense, ExpenseCategory } from '../types';

const CATEGORIES: ExpenseCategory[] = ['Food', 'Rent', 'Travel', 'Education', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const CAT_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Rent: '#3b82f6',
  Travel: '#22c55e',
  Education: '#6366f1',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#06b6d4',
  Other: '#64748b',
};

interface ExpensesPageProps {
  isNewExpenseModalOpen?: boolean;
  setIsNewExpenseModalOpen?: (open: boolean) => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ isNewExpenseModalOpen, setIsNewExpenseModalOpen }) => {
  const { expenses, addExpense, deleteExpense, getExpenseInsightsAI, totalMonthlySpend, totalAllTimeSpend, highestSpendingCategory } = useData();
  const [amount, setAmount]       = useState('');
  const [desc, setDesc]           = useState('');
  const [category, setCategory]   = useState<ExpenseCategory>('Food');
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showForm, setShowForm]   = useState(false);

  React.useEffect(() => {
    if (isNewExpenseModalOpen) {
      setShowForm(true);
      setIsNewExpenseModalOpen?.(false);
    }
  }, [isNewExpenseModalOpen, setIsNewExpenseModalOpen]);

  const handleAdd = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !desc.trim()) return;
    await addExpense({
      title: desc.trim(),
      amount: num,
      description: desc.trim(),
      category,
      expense_date: new Date().toISOString().split('T')[0],
    });
    setAmount(''); setDesc(''); setShowForm(false);
  };

  const handleAI = async () => {
    setAiLoading(true);
    try { setAiInsight((await getExpenseInsightsAI()) ?? ''); }
    finally { setAiLoading(false); }
  };

  const pieData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e: Expense) => { totals[e.category] = (totals[e.category] ?? 0) + e.amount; });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const areaData = useMemo(() => {
    const byDate: Record<string, number> = {};
    expenses.forEach((e: Expense) => {
      const dateVal = e.expense_date || e.date;
      const d = dateVal ? new Date(dateVal).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Unknown';
      byDate[d] = (byDate[d] ?? 0) + e.amount;
    });
    return Object.entries(byDate).slice(-14).map(([date, amount]) => ({ date, amount }));
  }, [expenses]);

  const fmt = (n: number) => '\u20B9'+n.toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:0});

  return (
    <div className="page-enter" style={{ padding:'2rem',maxWidth:1000,margin:'0 auto' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem',fontWeight:800,color:'#f1f5f9',margin:0 }}>Expenses</h1>
          <p style={{ color:'#64748b',margin:'0.25rem 0 0',fontSize:'0.875rem' }}>{expenses.length} transaction{expenses.length!==1?'s':''}</p>
        </div>
        <div style={{ display:'flex',gap:'0.75rem' }}>
          <button type="button" onClick={handleAI} disabled={aiLoading} aria-busy={aiLoading} className="btn-ghost" style={{ display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.8rem',color:'#a78bfa' }}>
            <Sparkles size={14} />{aiLoading?'Analysing…':'AI Insights'}
          </button>
          <button type="button" onClick={() => setShowForm(v=>!v)} className="btn-primary" style={{ display:'flex',alignItems:'center',gap:'0.4rem' }}>
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.75rem' }}>
        {([
          { label:'This Month', val:fmt(totalMonthlySpend),  icon:<TrendingUp size={18}/>, color:'#8b5cf6' },
          { label:'All Time',   val:fmt(totalAllTimeSpend),  icon:<DollarSign size={18}/>, color:'#06b6d4' },
          { label:'Top Category', val:highestSpendingCategory?.category ?? '—', icon:<DollarSign size={18}/>, color:'#f59e0b' },
        ]).map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
              <div>
                <p style={{ margin:0,fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',color:'#475569' }}>{s.label}</p>
                <p style={{ margin:'0.4rem 0 0',fontSize:'1.4rem',fontWeight:800,color:'#f1f5f9' }}>{s.val}</p>
              </div>
              <span style={{ color:s.color,opacity:0.8 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {aiInsight && (
        <div className="glass-card" style={{ padding:'1rem 1.25rem',marginBottom:'1.5rem',border:'1px solid rgba(139,92,246,0.25)',background:'rgba(139,92,246,0.06)' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
            <p style={{ margin:0,fontSize:'0.85rem',color:'#c4b5fd',lineHeight:1.6 }}><Sparkles size={13} style={{ display:'inline',marginRight:6,color:'#a78bfa' }} />{aiInsight}</p>
            <button type="button" onClick={() => setAiInsight('')} className="btn-icon" aria-label="Dismiss"><X size={14} /></button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass-card" style={{ padding:'1.25rem',marginBottom:'1.5rem' }}>
          <div style={{ display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'flex-end' }}>
            <div style={{ flex:'1',minWidth:140 }}>
              <label className="field-label" htmlFor="exp-amount">Amount (₹)</label>
              <input id="exp-amount" type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="field" />
            </div>
            <div style={{ flex:'2',minWidth:180 }}>
              <label className="field-label" htmlFor="exp-desc">Description</label>
              <input id="exp-desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What did you spend on?" className="field" />
            </div>
            <div style={{ minWidth:140 }}>
              <label className="field-label" htmlFor="exp-cat">Category</label>
              <select id="exp-cat" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <button type="button" onClick={handleAdd} className="btn-primary" style={{ display:'flex',alignItems:'center',gap:'0.4rem',whiteSpace:'nowrap' }}><Plus size={15} /> Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost" aria-label="Cancel"><X size={15} /></button>
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.25rem',marginBottom:'1.75rem' }}>
          <div className="glass-card" style={{ padding:'1.25rem' }}>
            <h3 style={{ margin:'0 0 1rem',fontSize:'0.85rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em' }}>Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                  {pieData.map((entry,i) => <Cell key={i} fill={CAT_COLORS[entry.name]??'#64748b'} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:'0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'0.4rem',marginTop:'0.75rem',justifyContent:'center' }}>
              {pieData.map(d => <span key={d.name} style={{ fontSize:'0.7rem',display:'flex',alignItems:'center',gap:'0.3rem',color:'#94a3b8' }}><span style={{ width:8,height:8,borderRadius:'50%',background:CAT_COLORS[d.name]??'#64748b',display:'inline-block' }} />{d.name}</span>)}
            </div>
          </div>
          <div className="glass-card" style={{ padding:'1.25rem' }}>
            <h3 style={{ margin:'0 0 1rem',fontSize:'0.85rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em' }}>Spending Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize:10,fill:'#475569' }} />
                <YAxis tick={{ fontSize:10,fill:'#475569' }} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:'0.78rem' }} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="ld-empty">
          <span className="ld-empty-icon"><DollarSign size={40} /></span>
          <p className="ld-empty-title">No expenses yet</p>
          <p className="ld-empty-desc">Track your first expense above.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {['Description','Category','Amount','Date',''].map(h => <th key={h} style={{ padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',whiteSpace:'nowrap' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {expenses.map((e: Expense) => (
                  <tr key={e.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.15s' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background='rgba(255,255,255,0.02)')}
                    onMouseLeave={ev => (ev.currentTarget.style.background='transparent')}>
                    <td style={{ padding:'0.75rem 1rem',fontSize:'0.875rem',color:'#e2e8f0' }}>{e.description}</td>
                    <td style={{ padding:'0.75rem 1rem' }}>
                      <span style={{ fontSize:'0.7rem',fontWeight:700,padding:'0.2rem 0.6rem',borderRadius:999,background:`${CAT_COLORS[e.category]}22`,color:CAT_COLORS[e.category]??'#64748b' }}>{e.category}</span>
                    </td>
                    <td style={{ padding:'0.75rem 1rem',fontSize:'0.875rem',fontWeight:700,color:'#f1f5f9' }}>{fmt(e.amount)}</td>
                    <td style={{ padding:'0.75rem 1rem',fontSize:'0.78rem',color:'#475569',whiteSpace:'nowrap' }}>{(e.expense_date || e.date) ? new Date(e.expense_date || e.date || '').toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding:'0.75rem 1rem' }}>
                      <button type="button" onClick={() => deleteExpense(e.id)} className="btn-icon" aria-label={`Delete ${e.description}`} style={{ color:'#ef4444' }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExpensesPage;
