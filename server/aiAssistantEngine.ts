/**
 * LifeDesk AI - Production Intelligence Engine
 * Intent Identification, Strict User Data Scoping, Pre-computed Grounding,
 * and Anti-Fabrication Safeguards.
 */

export type IntentType =
  | 'TASKS_TODAY'
  | 'UPCOMING_DEADLINES'
  | 'SPEND_THIS_MONTH'
  | 'SPEND_MOST'
  | 'SUMMARIZE_NOTES'
  | 'FOCUS_TODAY'
  | 'EXPENSE_CATEGORY'
  | 'DOCUMENTS_QA'
  | 'CREATOR_INFO'
  | 'GENERAL_WORKSPACE';

export interface IntentResult {
  type: IntentType;
  label: string;
  categoryParam?: string;
  confidence: number;
}

export interface UserContext {
  userId?: string;
  profile?: {
    full_name?: string;
    email?: string;
  };
  tasks?: Array<{
    id: string;
    user_id?: string;
    title: string;
    description?: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'In Progress' | 'Completed';
    due_date?: string;
    created_at?: string;
    updated_at?: string;
  }>;
  notes?: Array<{
    id: string;
    user_id?: string;
    title: string;
    content: string;
    ai_summary?: string;
    created_at?: string;
    updated_at?: string;
  }>;
  expenses?: Array<{
    id: string;
    user_id?: string;
    title: string;
    amount: number;
    category: string;
    expense_date: string;
    description?: string;
    created_at?: string;
  }>;
  documents?: Array<{
    id: string;
    user_id?: string;
    file_name: string;
    file_type?: string;
    summary?: string;
    text_content?: string;
    created_at?: string;
  }>;
}

const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Travel',
  'Education',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other',
];

/**
 * Step 1: Identify Intent with High-Precision Multi-Keyword & Semantic Analysis
 */
export function identifyUserIntent(query: string): IntentResult {
  const q = query.trim().toLowerCase();

  // 0. Creator / Developer Info
  if (
    q.includes('creator') ||
    q.includes('who created') ||
    q.includes('who developed') ||
    q.includes('who is the developer') ||
    q.includes('who is developer') ||
    q.includes('who built this') ||
    q.includes('who made this') ||
    q.includes('who built lifedesk') ||
    q.includes('who created lifedesk') ||
    q.includes('who made lifedesk') ||
    q.includes('tell me about the creator') ||
    q.includes('about the creator') ||
    q.includes('about the developer') ||
    q.includes('developer profile') ||
    q.includes('vasu desalla') ||
    q.includes('vasu') ||
    (/\b(creator|founder|developer|owner|builder|vasu|desalla)\b/.test(q) &&
      /\b(who|whos|whose|what|which|tell|about|info|details|profile|bio|evaru|evadu|enti|emiti|gurinchi|peru)\b/.test(q))
  ) {
    return {
      type: 'CREATOR_INFO',
      label: '👨‍💻 Creator & Founder Profile',
      confidence: 0.99,
    };
  }

  // 1. Tasks Today
  if (
    q.includes('tasks today') ||
    q.includes('task today') ||
    q.includes('tasks do i have today') ||
    q.includes('tasks for today') ||
    q.includes('what do i have today') ||
    q.includes('what is scheduled for today') ||
    q.includes('schedule today') ||
    q.includes("today's tasks") ||
    q.includes('on my plate today') ||
    (q.includes('task') && q.includes('today')) ||
    (q.includes('todo') && q.includes('today'))
  ) {
    return {
      type: 'TASKS_TODAY',
      label: '🎯 Tasks Today',
      confidence: 0.98,
    };
  }

  // 2. Upcoming Deadlines
  if (
    q.includes('upcoming deadline') ||
    q.includes('upcoming deadlines') ||
    q.includes('my deadlines') ||
    q.includes('deadlines') ||
    q.includes('due soon') ||
    q.includes('due dates') ||
    q.includes('due date') ||
    q.includes('what is due') ||
    q.includes("what's due") ||
    q.includes('due this week') ||
    q.includes('due tomorrow') ||
    (q.includes('deadline') && (q.includes('task') || q.includes('upcoming')))
  ) {
    return {
      type: 'UPCOMING_DEADLINES',
      label: '📅 Upcoming Deadlines',
      confidence: 0.96,
    };
  }

  // 3. Spend This Month
  if (
    q.includes('spend this month') ||
    q.includes('spent this month') ||
    q.includes('spending this month') ||
    q.includes('expenses this month') ||
    q.includes('monthly spend') ||
    q.includes('monthly expenses') ||
    q.includes('monthly total') ||
    q.includes('how much did i spend this month') ||
    q.includes('how much have i spent this month') ||
    (q.includes('month') && (q.includes('spend') || q.includes('spent') || q.includes('cost')))
  ) {
    return {
      type: 'SPEND_THIS_MONTH',
      label: '💰 Monthly Spending',
      confidence: 0.97,
    };
  }

  // 4. Spend Most (Top spending / highest category)
  if (
    q.includes('spend most') ||
    q.includes('spent most') ||
    q.includes('spend the most') ||
    q.includes('spent the most') ||
    q.includes('highest spending') ||
    q.includes('top spending') ||
    q.includes('top category') ||
    q.includes('biggest expense') ||
    q.includes('largest expense') ||
    q.includes('where did most of my money go') ||
    q.includes('where is my money going') ||
    q.includes('highest expense')
  ) {
    return {
      type: 'SPEND_MOST',
      label: '📊 Top Spending & Category',
      confidence: 0.95,
    };
  }

  // 5. Specific Category Spending (e.g. "how much did I spend on food?")
  for (const cat of EXPENSE_CATEGORIES) {
    const catLower = cat.toLowerCase();
    if (
      q.includes(catLower) &&
      (q.includes('spend') || q.includes('spent') || q.includes('cost') || q.includes('expense') || q.includes('how much'))
    ) {
      return {
        type: 'EXPENSE_CATEGORY',
        label: `💳 ${cat} Expenses`,
        categoryParam: cat,
        confidence: 0.94,
      };
    }
  }

  // 6. Summarize Notes
  if (
    q.includes('summarize my recent notes') ||
    q.includes('summarize my notes') ||
    q.includes('summarize notes') ||
    q.includes('summary of my notes') ||
    q.includes('notes summary') ||
    q.includes('recent notes') ||
    q.includes('what did i write') ||
    (q.includes('note') && (q.includes('summar') || q.includes('recap') || q.includes('review') || q.includes('key points')))
  ) {
    return {
      type: 'SUMMARIZE_NOTES',
      label: '📝 Notes Summary',
      confidence: 0.96,
    };
  }

  // 7. Focus Today / Prioritize
  if (
    q.includes('focus on today') ||
    q.includes('focus today') ||
    q.includes('should i focus on') ||
    q.includes('what to focus on') ||
    q.includes('what should i do today') ||
    q.includes('prioritize my day') ||
    q.includes('prioritize tasks') ||
    q.includes('what to work on first') ||
    q.includes('tackle first') ||
    q.includes('daily focus') ||
    q.includes('where should i start')
  ) {
    return {
      type: 'FOCUS_TODAY',
      label: '⚡ Daily Focus & Priority',
      confidence: 0.95,
    };
  }

  // 8. Documents QA
  if (
    q.includes('document') ||
    q.includes('pdf') ||
    q.includes('uploaded file') ||
    q.includes('contract') ||
    q.includes('attachment')
  ) {
    return {
      type: 'DOCUMENTS_QA',
      label: '📄 Document Intelligence',
      confidence: 0.9,
    };
  }

  // Default: General Workspace
  return {
    type: 'GENERAL_WORKSPACE',
    label: '✨ LifeDesk Workspace',
    confidence: 0.7,
  };
}

/**
 * Step 2 & 3: Query strictly user data, pre-compute exact figures, and build structured context.
 */
export function buildStructuredContext(
  intent: IntentResult,
  context: UserContext,
  now: Date = new Date()
): {
  systemInstruction: string;
  userPromptContext: string;
  exactMetrics: any;
  groundedFallbackResponse: string;
} {
  const userId = context.userId || '';
  const profile = context.profile || { full_name: 'Workspace User' };

  // Strict User Isolation: Filter out any items that don't belong to this user
  const allTasks = (context.tasks || []).filter((t) => !userId || !t.user_id || t.user_id === userId);
  const allExpenses = (context.expenses || []).filter((e) => !userId || !e.user_id || e.user_id === userId);
  const allNotes = (context.notes || []).filter((n) => !userId || !n.user_id || n.user_id === userId);
  const allDocs = (context.documents || []).filter((d) => !userId || !d.user_id || d.user_id === userId);

  // Time & Date Anchors
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentYearMonth = todayStr.slice(0, 7); // YYYY-MM
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now);
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  // Pre-calculate exact numbers for each domain
  // A. Tasks calculations
  const pendingTasks = allTasks.filter((t) => t.status !== 'Completed');
  const completedTasks = allTasks.filter((t) => t.status === 'Completed');
  const highPriorityPending = pendingTasks.filter((t) => t.priority === 'High');
  const tasksDueToday = allTasks.filter((t) => t.due_date === todayStr);
  const overdueTasks = pendingTasks.filter((t) => t.due_date && t.due_date < todayStr);

  // Sort upcoming deadlines
  const upcomingDeadlines = pendingTasks
    .filter((t) => Boolean(t.due_date))
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

  // B. Expenses calculations
  const currentMonthExpenses = allExpenses.filter((e) => e.expense_date && e.expense_date.startsWith(currentYearMonth));
  const currentMonthTotal = currentMonthExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const allTimeTotal = allExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  allExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  let topCategory = 'None';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amt;
    }
  });
  const topCategoryPercentage = allTimeTotal > 0 ? (topCategoryAmount / allTimeTotal) * 100 : 0;

  // Single highest individual expense
  const sortedExpensesByAmount = [...allExpenses].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
  const highestSingleExpense = sortedExpensesByAmount[0] || null;

  // C. Notes calculations
  const sortedNotes = [...allNotes].sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));

  const exactMetrics = {
    todayStr,
    todayFormatted,
    currentYearMonth,
    monthName,
    tasksCount: allTasks.length,
    pendingTasksCount: pendingTasks.length,
    completedTasksCount: completedTasks.length,
    highPriorityPendingCount: highPriorityPending.length,
    tasksDueTodayCount: tasksDueToday.length,
    overdueTasksCount: overdueTasks.length,
    currentMonthExpenseCount: currentMonthExpenses.length,
    currentMonthTotal: Number(currentMonthTotal.toFixed(2)),
    allTimeExpenseCount: allExpenses.length,
    allTimeTotal: Number(allTimeTotal.toFixed(2)),
    topCategory,
    topCategoryAmount: Number(topCategoryAmount.toFixed(2)),
    topCategoryPercentage: Number(topCategoryPercentage.toFixed(1)),
    notesCount: allNotes.length,
    documentsCount: allDocs.length,
  };

  // Build specialized grounded structured context based on intent
  let intentSpecificBlock = '';
  let groundedFallback = '';

  switch (intent.type) {
    case 'TASKS_TODAY': {
      const todayActionItems = allTasks.filter(
        (t) => t.due_date === todayStr || (t.status !== 'Completed' && (!t.due_date || t.due_date <= todayStr))
      );
      intentSpecificBlock = `
INTENT FOCUS: TASKS TODAY
TODAY'S DATE: ${todayFormatted} (${todayStr})
TOTAL TASKS DUE TODAY: ${tasksDueToday.length}
PENDING TASKS REQUIRING ATTENTION: ${todayActionItems.filter((t) => t.status !== 'Completed').length}
TASKS COMPLETED TODAY: ${tasksDueToday.filter((t) => t.status === 'Completed').length}

RELEVANT TASKS FOR TODAY:
${
  todayActionItems.length > 0
    ? todayActionItems
        .map(
          (t, i) =>
            `${i + 1}. [${t.status.toUpperCase()}] "${t.title}" | Priority: ${t.priority} | Due Date: ${t.due_date || 'Today (Flexible)'} | Details: ${t.description || 'None'}`
        )
        .join('\n')
    : 'No tasks scheduled specifically for today.'
}
`;
      if (todayActionItems.length === 0) {
        groundedFallback = `### 🎯 Tasks for Today (${todayFormatted})\n\nYou currently have **no tasks scheduled for today** in your LifeDesk database.\n\n- **Active Workspace Status**: You have **${pendingTasks.length} pending tasks** overall, but none with today's deadline.\n- **Quick Action**: Would you like to create a new task or review your upcoming deadlines?`;
      } else {
        const pendingToday = todayActionItems.filter((t) => t.status !== 'Completed');
        const completedToday = todayActionItems.filter((t) => t.status === 'Completed');
        groundedFallback = `### 🎯 Tasks for Today (${todayFormatted})\n\nYou have **${todayActionItems.length} tasks** on your radar today (**${pendingToday.length} pending**, **${completedToday.length} completed**):\n\n${pendingToday
          .map(
            (t) =>
              `- **${t.title}**\n  - Priority: \`${t.priority}\` • Status: *${t.status}*${t.due_date ? ` • Due: ${t.due_date}` : ''}${t.description ? `\n  - Notes: ${t.description}` : ''}`
          )
          .join('\n\n')}${
          completedToday.length > 0
            ? `\n\n**Completed Today:**\n${completedToday.map((t) => `- ~~${t.title}~~ (Done)`).join('\n')}`
            : ''
        }\n\n**Productivity Advice**: Focus on your **${highPriorityPending.length} high-priority item(s)** first to gain early momentum today!`;
      }
      break;
    }

    case 'UPCOMING_DEADLINES': {
      intentSpecificBlock = `
INTENT FOCUS: UPCOMING DEADLINES
CURRENT DATE: ${todayFormatted} (${todayStr})
TOTAL PENDING TASKS WITH DEADLINES: ${upcomingDeadlines.length}
OVERDUE TASKS: ${overdueTasks.length}

CHRONOLOGICAL DEADLINES LIST:
${
  upcomingDeadlines.length > 0
    ? upcomingDeadlines
        .map((t, i) => {
          let timeline = 'Future';
          if (t.due_date && t.due_date < todayStr) timeline = '⚠️ OVERDUE';
          else if (t.due_date === todayStr) timeline = '🎯 DUE TODAY';
          return `${i + 1}. [${timeline}] "${t.title}" | Due: ${t.due_date} | Priority: ${t.priority} | Status: ${t.status}`;
        })
        .join('\n')
    : 'No upcoming deadlines found in database.'
}
`;
      if (upcomingDeadlines.length === 0) {
        groundedFallback = `### 📅 Upcoming Deadlines\n\nYou currently have **no upcoming deadlines** recorded in your LifeDesk database.\n\nAll your current tasks either have no deadline assigned or are already completed. Add due dates to your tasks to track upcoming milestones!`;
      } else {
        groundedFallback = `### 📅 Your Upcoming Deadlines\n\nHere are your scheduled deadlines, ordered chronologically:\n\n${upcomingDeadlines
          .map((t) => {
            const isOverdue = t.due_date && t.due_date < todayStr;
            const isToday = t.due_date === todayStr;
            const badge = isOverdue ? '⚠️ **Overdue**' : isToday ? '🎯 **Due Today**' : `📅 Due ${t.due_date}`;
            return `- **${t.title}** (${badge})\n  - Priority: \`${t.priority}\` • Status: *${t.status}*`;
          })
          .join('\n\n')}\n\n${overdueTasks.length > 0 ? `> ⚠️ You have **${overdueTasks.length} overdue task(s)**. Recommend tackling these immediately.` : '> 💡 All upcoming deadlines are on schedule.'}`;
      }
      break;
    }

    case 'SPEND_THIS_MONTH': {
      intentSpecificBlock = `
INTENT FOCUS: MONTHLY SPENDING
CALENDAR MONTH: ${monthName} (${currentYearMonth})
TOTAL SPENT THIS MONTH: $${currentMonthTotal.toFixed(2)}
TRANSACTIONS THIS MONTH: ${currentMonthExpenses.length}

ITEMIZED TRANSACTIONS THIS MONTH:
${
  currentMonthExpenses.length > 0
    ? currentMonthExpenses
        .map(
          (e, i) =>
            `${i + 1}. $${Number(e.amount).toFixed(2)} - [${e.category}] "${e.title}" on ${e.expense_date}${e.description ? ` (${e.description})` : ''}`
        )
        .join('\n')
    : 'No expenses recorded for this month.'
}
`;
      if (currentMonthExpenses.length === 0) {
        groundedFallback = `### 💰 Spending for ${monthName}\n\nAccording to your records, you have spent **$0.00** so far in **${monthName}** (0 transactions logged).\n\n- **All-Time Total**: You have **$${allTimeTotal.toFixed(2)}** recorded across all prior periods.\n- To track new purchases, click the **Log Expense** button in the dashboard or expenses tab.`;
      } else {
        groundedFallback = `### 💰 Monthly Spend Summary for ${monthName}\n\nYou have spent **$${currentMonthTotal.toFixed(2)}** across **${currentMonthExpenses.length} transactions** this month.\n\n**Itemized Purchases:**\n${currentMonthExpenses
          .map((e) => `- **$${Number(e.amount).toFixed(2)}** — *${e.title}* (\`${e.category}\` on ${e.expense_date})`)
          .join('\n')}\n\n- **All-Time Spend**: $${allTimeTotal.toFixed(2)}\n- **Top Category Overall**: ${topCategory} ($${topCategoryAmount.toFixed(2)})`;
      }
      break;
    }

    case 'SPEND_MOST': {
      const categoryBreakdownText = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amt]) => {
          const pct = allTimeTotal > 0 ? (amt / allTimeTotal) * 100 : 0;
          return `• ${cat}: $${amt.toFixed(2)} (${pct.toFixed(1)}% of total, ${categoryCounts[cat] || 0} items)`;
        })
        .join('\n');

      intentSpecificBlock = `
INTENT FOCUS: HIGHEST SPENDING & CATEGORY BREAKDOWN
TOTAL ALL-TIME SPEND: $${allTimeTotal.toFixed(2)}
NUMBER ONE SPENDING CATEGORY: ${topCategory} ($${topCategoryAmount.toFixed(2)}, ${topCategoryPercentage.toFixed(1)}% of total spend)
SINGLE LARGEST PURCHASE: ${highestSingleExpense ? `"${highestSingleExpense.title}" ($${Number(highestSingleExpense.amount).toFixed(2)} in ${highestSingleExpense.category} on ${highestSingleExpense.expense_date})` : 'None'}

FULL CATEGORY BREAKDOWN:
${categoryBreakdownText || 'No expense data available.'}
`;
      if (allExpenses.length === 0) {
        groundedFallback = `### 📊 Spending Breakdown\n\nYou haven't logged any expenses yet. Once you record transactions, I'll calculate your highest spending category and cost distributions!`;
      } else {
        groundedFallback = `### 📊 What You Spent the Most On\n\nYour highest spending category is **${topCategory}**, totaling **$${topCategoryAmount.toFixed(2)}** (**${topCategoryPercentage.toFixed(1)}%** of your all-time total spend of $${allTimeTotal.toFixed(2)}).\n\n${highestSingleExpense ? `**Single Largest Purchase:**\n- **${highestSingleExpense.title}**: **$${Number(highestSingleExpense.amount).toFixed(2)}** (\`${highestSingleExpense.category}\` on ${highestSingleExpense.expense_date})\n\n` : ''}**Category Distribution:**\n${Object.entries(categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .map(([cat, amt]) => {
            const pct = allTimeTotal > 0 ? (amt / allTimeTotal) * 100 : 0;
            return `- **${cat}**: $${amt.toFixed(2)} (${pct.toFixed(0)}%)`;
          })
          .join('\n')}`;
      }
      break;
    }

    case 'EXPENSE_CATEGORY': {
      const cat = intent.categoryParam || 'Food';
      const catExpenses = allExpenses.filter((e) => (e.category || '').toLowerCase() === cat.toLowerCase());
      const catTotal = catExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
      intentSpecificBlock = `
INTENT FOCUS: CATEGORY EXPENSES FOR "${cat}"
TOTAL SPENT IN ${cat.toUpperCase()}: $${catTotal.toFixed(2)}
NUMBER OF TRANSACTIONS: ${catExpenses.length}

TRANSACTIONS:
${catExpenses.map((e, i) => `${i + 1}. $${Number(e.amount).toFixed(2)} - "${e.title}" on ${e.expense_date}`).join('\n') || 'None recorded.'}
`;
      if (catExpenses.length === 0) {
        groundedFallback = `### 💳 ${cat} Expenses\n\nYou currently have **$0.00** recorded for **${cat}** (0 transactions found in your database).`;
      } else {
        groundedFallback = `### 💳 ${cat} Spending\n\nYou have spent a total of **$${catTotal.toFixed(2)}** across **${catExpenses.length} transactions** in the **${cat}** category:\n\n${catExpenses.map((e) => `- **$${Number(e.amount).toFixed(2)}** — *${e.title}* (${e.expense_date})`).join('\n')}`;
      }
      break;
    }

    case 'SUMMARIZE_NOTES': {
      intentSpecificBlock = `
INTENT FOCUS: SUMMARIZE RECENT NOTES
TOTAL USER NOTES: ${allNotes.length}

RECENT NOTES TO SUMMARIZE:
${
  sortedNotes.length > 0
    ? sortedNotes
        .slice(0, 8)
        .map(
          (n, i) =>
            `${i + 1}. Title: "${n.title}" (Date: ${n.updated_at || n.created_at || 'Recent'})\n   Content: ${n.content?.slice(0, 400)}...\n   AI Summary: ${n.ai_summary || 'None'}`
        )
        .join('\n\n')
    : 'No notes found in database.'
}
`;
      if (allNotes.length === 0) {
        groundedFallback = `### 📝 Notes Summary\n\nYou currently have **no notes** in your LifeDesk database. Create your first note in the Notes tab, and I will automatically synthesize and summarize your ideas!`;
      } else {
        groundedFallback = `### 📝 Summary of Your Recent Notes\n\nYou have **${allNotes.length} notes** in your workspace. Here is a high-level synthesis of your latest entries:\n\n${sortedNotes
          .slice(0, 5)
          .map((n) => `- **${n.title}**\n  ${n.ai_summary ? `*Summary*: ${n.ai_summary}` : `${n.content?.slice(0, 160)}...`}`)
          .join('\n\n')}\n\n**Takeaway**: Your recent entries highlight key working concepts and active thoughts. Keep documenting key milestones!`;
      }
      break;
    }

    case 'FOCUS_TODAY': {
      intentSpecificBlock = `
INTENT FOCUS: WHAT TO FOCUS ON TODAY
TODAY: ${todayFormatted}
PENDING TASKS: ${pendingTasks.length}
HIGH PRIORITY TASKS: ${highPriorityPending.length}
OVERDUE TASKS: ${overdueTasks.length}
TASKS DUE TODAY: ${tasksDueToday.filter((t) => t.status !== 'Completed').length}

HIGH PRIORITY / URGENT TASKS:
${
  highPriorityPending.length > 0
    ? highPriorityPending.map((t, i) => `${i + 1}. "${t.title}" | Due: ${t.due_date || 'None'} | Notes: ${t.description || 'N/A'}`).join('\n')
    : 'No high-priority tasks pending.'
}

OVERDUE OR DUE TODAY:
${
  overdueTasks.concat(tasksDueToday.filter((t) => t.status !== 'Completed')).length > 0
    ? overdueTasks
        .concat(tasksDueToday.filter((t) => t.status !== 'Completed'))
        .map((t, i) => `${i + 1}. "${t.title}" | Due: ${t.due_date} | Priority: ${t.priority}`)
        .join('\n')
    : 'No overdue or due today tasks.'
}
`;
      groundedFallback = `### ⚡ What to Focus On Today (${todayFormatted})\n\nBased on your database deadlines and priorities, here is your recommended focus blueprint:\n\n1. **High-Impact Priority First**:\n${
        highPriorityPending.length > 0
          ? highPriorityPending.map((t) => `   - **${t.title}** (Priority: \`High\`, Due: ${t.due_date || 'Soon'})`).join('\n')
          : '   - *No urgent High-priority tasks pending! Move to medium items.*'
      }\n\n2. **Time-Sensitive Deadlines**:\n${
        overdueTasks.concat(tasksDueToday.filter((t) => t.status !== 'Completed')).length > 0
          ? overdueTasks.concat(tasksDueToday.filter((t) => t.status !== 'Completed')).map((t) => `   - **${t.title}** (${t.due_date < todayStr ? '⚠️ Overdue' : 'Due Today'})`).join('\n')
          : '   - *You have no overdue or immediate deadlines today.*'
      }\n\n3. **Recommended Strategy**:\n   - Dedicate your first 90-minute focus block to your highest-priority item.\n   - Review your pending tasks (${pendingTasks.length} total) and check off quick wins before end of day.`;
      break;
    }

    case 'CREATOR_INFO': {
      intentSpecificBlock = `
INTENT FOCUS: CREATOR PROFILE & FOUNDER INFORMATION
NAME: Vasu Desalla
ROLE: Founder & Full-Stack Developer of LifeDesk AI
EDUCATION: B.Tech in Computer Science Engineering
PROJECT: LifeDesk AI — Personal Productivity & Life OS
EMAIL: vasudesalla777@gmail.com
GITHUB: https://github.com/vasudesalla
LINKEDIN: https://linkedin.com/in/vasudesalla
PORTFOLIO: https://vasudesalla.com
CORE EXPERTISE: React & TypeScript, Supabase PostgreSQL, Row Level Security, AI Grounding & LLM Engineering.
`;
      groundedFallback = `### 👨‍💻 About the Creator & Developer\n\n**LifeDesk AI** was designed, developed, and founded by **Vasu Desalla**.\n\n- **Role**: Founder & Full-Stack Developer\n- **Education**: B.Tech in Computer Science Engineering\n- **Project**: LifeDesk AI — an AI-powered personal productivity platform combining cloud data persistence, intelligent automation, and database-grounded conversational AI.\n- **Email**: [vasudesalla777@gmail.com](mailto:vasudesalla777@gmail.com)\n- **GitHub**: [github.com/vasudesalla](https://github.com/vasudesalla)\n- **LinkedIn**: [linkedin.com/in/vasudesalla](https://linkedin.com/in/vasudesalla)\n- **Portfolio**: [vasudesalla.com](https://vasudesalla.com)`;
      break;
    }

    default: {
      intentSpecificBlock = `
USER PROFILE:
- Name: ${profile.full_name || 'Workspace User'}
- Email: ${profile.email || 'user@lifedesk.ai'}

DATABASE SUMMARY:
- Tasks: ${allTasks.length} total (${pendingTasks.length} pending, ${highPriorityPending.length} high priority)
- Expenses: ${allExpenses.length} total ($${allTimeTotal.toFixed(2)} all-time, $${currentMonthTotal.toFixed(2)} this month in ${monthName})
- Notes: ${allNotes.length} total
- Documents: ${allDocs.length} total
`;
      groundedFallback = `Hello ${profile.full_name?.split(' ')[0] || 'there'}! I am your LifeDesk Assistant, directly connected to your authenticated workspace.\n\n**Current Workspace Snapshot:**\n- **Tasks**: ${pendingTasks.length} active (${highPriorityPending.length} high-priority)\n- **Expenses**: $${currentMonthTotal.toFixed(2)} spent this month in ${monthName} ($${allTimeTotal.toFixed(2)} all-time)\n- **Knowledge**: ${allNotes.length} notes, ${allDocs.length} documents uploaded\n\nFeel free to ask questions like: *"What tasks do I have today?"*, *"How much did I spend this month?"*, or *"Summarize my recent notes."*`;
      break;
    }
  }

  const systemInstruction = `You are LifeDesk AI, an intelligent, personal productivity and workspace copilot.
You have direct, real-time read access to the authenticated user's private database records.

DETECTED INTENT: ${intent.label} (${intent.type})
USER: ${profile.full_name || 'Workspace User'}

STRICT GROUNDING & ANTI-FABRICATION RULES:
1. ONLY USE REAL DATA: Answer based STRICTLY on the real user records and exact pre-computed numbers provided below.
2. NEVER FABRICATE: If the user asks about an item not in their database, state clearly and politely that you checked their LifeDesk records and found no matching records. Never invent fake tasks, fake dollar amounts, or fake notes.
3. PRECISE NUMBERS: Always use the exact pre-calculated totals and dates provided. Do not re-estimate or alter dollar sums.
4. BEAUTIFUL MARKDOWN: Use bold headings, bullet points, and clean syntax formatting for high readability.
5. PRIVACY: You are strictly scoped to the authenticated user's data. Never expose or reference another user's data.
6. CREATOR INQUIRIES: When asked who created, developed, or founded LifeDesk AI, ALWAYS state that Vasu Desalla (B.Tech in Computer Science Engineering) is the creator and founder. Provide his verified details and links.

STRUCTURED DATABASE CONTEXT FOR CURRENT QUERY:
${intentSpecificBlock}

GENERAL USER CONTEXT:
- Total Tasks in DB: ${allTasks.length} (${pendingTasks.length} pending)
- Total Expenses in DB: ${allExpenses.length} ($${allTimeTotal.toFixed(2)} all-time)
- Total Notes in DB: ${allNotes.length}
- Total Documents in DB: ${allDocs.length}
`;

  return {
    systemInstruction,
    userPromptContext: intentSpecificBlock,
    exactMetrics,
    groundedFallbackResponse: groundedFallback,
  };
}
