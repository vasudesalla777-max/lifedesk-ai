import express from 'express';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  identifyUserIntent,
  buildStructuredContext,
  UserContext,
} from './server/aiAssistantEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
        timeout: 20000,
        retryOptions: {
          attempts: 1,
          initialDelay: 1,
        },
      },
    });
  }
  return aiClient;
}

// Model chains: primary model first, verified-capacity fallbacks after.
const STANDARD_MODEL_CHAIN = [
  'gemini-3.8-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];
const THINKING_MODEL_CHAIN = ['gemini-3.1-pro-preview', ...STANDARD_MODEL_CHAIN];

interface GeneratedReply {
  text: string;
  model: string;
}

// Tries each model in the chain until one returns usable text.
async function generateWithFallback(
  ai: GoogleGenAI,
  contents: string,
  config: any,
  modelChain: string[]
): Promise<GeneratedReply> {
  let lastError: any = new Error('No Gemini model available');
  for (const model of modelChain) {
    try {
      const response = await ai.models.generateContent({ model, contents, config });
      if (response.text && response.text.trim()) {
        return { text: response.text, model };
      }
      lastError = new Error(`Empty response from ${model}`);
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} unavailable, trying next model:`, err?.message);
    }
  }
  throw lastError;
}

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// AI Chatbot with Database-Aware Intelligence & Thinking Mode
// ----------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context, useThinking = false } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // 1. Identify Intent
    const intent = identifyUserIntent(message);

    // 2. Query only current user's data & build structured context
    const { systemInstruction, userPromptContext, exactMetrics, groundedFallbackResponse } =
      buildStructuredContext(intent, context || {});

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful offline fallback grounded in user's real DB records
      res.json({
        response: groundedFallbackResponse,
        model: 'local-grounded-engine',
        thinkingUsed: false,
        intent: intent.label,
        metrics: exactMetrics,
      });
      return;
    }

    let replyText = '';
    let usedModel = 'gemini-3.8-flash';
    let thinkingUsed = false;

    const fullUserPrompt = `USER QUERY: "${message}"\n\nIDENTIFIED INTENT: ${intent.label}\n\nSTRUCTURED DATABASE RECORDS:\n${userPromptContext}`;

    // 3 & 4. Execute with thinking mode or standard model (with model fallback chain)
    try {
      const config: any = { systemInstruction };
      if (useThinking) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }
      const result = await generateWithFallback(
        ai,
        fullUserPrompt,
        config,
        useThinking ? THINKING_MODEL_CHAIN : STANDARD_MODEL_CHAIN
      );
      usedModel = result.model;
      replyText = result.text;
      thinkingUsed = useThinking && usedModel === THINKING_MODEL_CHAIN[0];
    } catch (err: any) {
      console.warn('Gemini chat request failed, using grounded database fallback:', err?.message);
      replyText = groundedFallbackResponse;
    }

    res.json({
      response: replyText,
      model: usedModel,
      thinkingUsed,
      intent: intent.label,
      metrics: exactMetrics,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({
      error: 'Failed to process AI chat request',
      details: error?.message || 'Internal server error',
    });
  }
});

// ----------------------------------------------------
// AI Note Summarization
// ----------------------------------------------------
app.post('/api/ai/summarize-note', async (req, res) => {
  const { title, content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Note content is required' });
    return;
  }

  const generateLocalSummary = (t: string, c: string) => {
    const clean = c.replace(/\s+/g, ' ').trim();
    const firstSentences = clean.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
    return `Summary of "${t || 'Note'}": ${firstSentences || clean.slice(0, 180)}${clean.length > 180 ? '...' : ''}`;
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.json({ summary: generateLocalSummary(title, content) });
      return;
    }

    const result = await generateWithFallback(
      ai,
      `Please provide a concise, high-value 2-3 sentence executive summary of this note titled "${title || 'Untitled'}":\n\n${content}`,
      {
        systemInstruction: 'You are an executive assistant specializing in concise, actionable information summaries.',
      },
      STANDARD_MODEL_CHAIN
    );

    res.json({
      summary: result.text.trim() || generateLocalSummary(title, content),
    });
  } catch (error: any) {
    console.warn('Gemini API call in /api/ai/summarize-note encountered error, utilizing intelligent local summary:', error?.message);
    res.json({
      summary: generateLocalSummary(title, content),
    });
  }
});

// ----------------------------------------------------
// AI Task Prioritization
// ----------------------------------------------------
app.post('/api/ai/prioritize-tasks', async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    res.json({
      recommendation: 'No tasks found to prioritize.',
      suggestedOrder: [],
    });
    return;
  }

  const localHeuristicPrioritization = (taskList: any[]) => {
    const sorted = [...taskList].sort((a, b) => {
      const pOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
      return (pOrder[a.priority] || 4) - (pOrder[b.priority] || 4);
    });
    const highTasks = sorted.filter((t) => t.priority === 'High');
    return {
      recommendation: `Prioritize your ${highTasks.length} High-priority task(s) first, beginning with "${sorted[0]?.title || 'your top task'}". Focus on high-impact milestones before proceeding to lower-priority items.`,
      suggestedOrder: sorted.map((t) => t.id),
    };
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.json(localHeuristicPrioritization(tasks));
      return;
    }

    const taskListString = tasks
      .map(
        (t: any, idx: number) =>
          `${idx + 1}. [${t.priority}] "${t.title}" (Status: ${t.status}, Due: ${t.due_date || 'No date'}, Notes: ${t.description || 'N/A'})`
      )
      .join('\n');

    const prompt = `Analyze these personal tasks and provide an expert prioritization strategy based on the Eisenhower Matrix, deadlines, and impact:\n\n${taskListString}\n\nProvide:
1. A clear recommendation of what to tackle first today and why.
2. A breakdown of Quick Wins vs High-Impact tasks.
3. Keep the advice actionable, motivating, and concise.`;

    const result = await generateWithFallback(
      ai,
      prompt,
      {
        systemInstruction: 'You are a high-performance productivity coach.',
      },
      STANDARD_MODEL_CHAIN
    );

    res.json({
      recommendation: result.text || localHeuristicPrioritization(tasks).recommendation,
      suggestedOrder: localHeuristicPrioritization(tasks).suggestedOrder,
    });
  } catch (error: any) {
    console.warn('Gemini API call in /api/ai/prioritize-tasks encountered error, using local heuristic prioritization:', error?.message);
    res.json(localHeuristicPrioritization(tasks));
  }
});

// ----------------------------------------------------
// AI Expense Insights
// ----------------------------------------------------
app.post('/api/ai/expense-insights', async (req, res) => {
  const { expenses } = req.body;
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    res.json({
      insights: 'No expense records available yet to generate insights. Log your first few purchases to see intelligent spending trends.',
    });
    return;
  }

  const localHeuristicInsights = (expenseList: any[]) => {
    const total = expenseList.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const catMap: Record<string, number> = {};
    expenseList.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount || 0);
    });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] || ['General', 0];
    const topPct = total > 0 ? Math.round((topCat[1] / total) * 100) : 0;
    return `### 📊 Spending Summary & Analysis\n\n- **Total Tracked Expenditure**: **$${total.toFixed(2)}** across **${expenseList.length}** transaction(s).\n- **Primary Spending Driver**: **${topCat[0]}** accounts for **$${topCat[1].toFixed(2)}** (${topPct}% of your total outflow).\n\n**Actionable Advice**:\n1. Keep discretionary purchases in **${topCat[0]}** budgeted to a fixed weekly limit.\n2. Regularly log small transactions to avoid unmonitored cash leaks.`;
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.json({ insights: localHeuristicInsights(expenses) });
      return;
    }

    const expenseList = expenses
      .map((e) => `• $${Number(e.amount).toFixed(2)} - [${e.category}] ${e.title} (${e.expense_date})`)
      .join('\n');

    const result = await generateWithFallback(
      ai,
      `Analyze these real personal expense transactions:\n\n${expenseList}\n\nProvide:
1. Highest spending category assessment with percentage or dollar share.
2. 2-3 specific, actionable suggestions for budget optimization.
3. Positive encouragement on healthy spending habits. Format with clean bullet points.`,
      {
        systemInstruction: 'You are a friendly personal financial advisor and budgeting expert.',
      },
      STANDARD_MODEL_CHAIN
    );

    res.json({
      insights: result.text || localHeuristicInsights(expenses),
    });
  } catch (error: any) {
    console.warn('Gemini API call in /api/ai/expense-insights encountered error, using local financial insights:', error?.message);
    res.json({
      insights: localHeuristicInsights(expenses),
    });
  }
});

// ----------------------------------------------------
// AI Document Intelligence Q&A & Summarization
// ----------------------------------------------------
app.post('/api/ai/document-qa', async (req, res) => {
  const { documentName, documentContent, question, isSummary = false } = req.body;

  if (!documentContent) {
    res.status(400).json({ error: 'Document content is required' });
    return;
  }

  const localDocumentFallback = () => {
    if (isSummary) {
      const preview = documentContent.slice(0, 320).trim();
      return `### Summary of ${documentName || 'Document'}\n\n${preview}...\n\n*Key Content Preview extracted from document text.*`;
    }
    const qTerms = String(question || '')
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const lines = documentContent.split('\n');
    const matches = lines.filter((l: string) => qTerms.some((t) => l.toLowerCase().includes(t)));
    const excerpt = matches.slice(0, 3).join('\n') || documentContent.slice(0, 200);
    return `Based on **${documentName || 'the document'}**:\n\n> "${excerpt.trim()}"\n\n*(Directly referenced from document text)*`;
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.json({ answer: localDocumentFallback() });
      return;
    }

    let prompt = '';
    if (isSummary) {
      prompt = `Provide a comprehensive yet scannable summary of the following document titled "${documentName}". Highlight key points, dates, and obligations:\n\n${documentContent}`;
    } else {
      prompt = `Based on the document titled "${documentName}" below, answer the user's question:\n\nDOCUMENT:\n${documentContent}\n\nQUESTION: ${question}\n\nAnswer accurately citing relevant clauses or lines from the document.`;
    }

    const result = await generateWithFallback(
      ai,
      prompt,
      {
        systemInstruction: 'You are a document intelligence analyst. Answer accurately strictly based on the document text.',
      },
      STANDARD_MODEL_CHAIN
    );

    res.json({
      answer: result.text || localDocumentFallback(),
    });
  } catch (error: any) {
    console.warn('Gemini API call in /api/ai/document-qa encountered error, using local document fallback:', error?.message);
    res.json({
      answer: localDocumentFallback(),
    });
  }
});

// ----------------------------------------------------
// AI Daily Productivity Briefing
// ----------------------------------------------------
app.post('/api/ai/daily-brief', async (req, res) => {
  const { tasks, notes, expenses, userName = 'there' } = req.body;

  const localDailyBrief = () => {
    const pendingCount = (tasks || []).filter((t: any) => t.status !== 'Completed').length;
    return `Good day, ${userName}! You have ${pendingCount} active task(s) on your agenda. Tackle your high-priority items first to gain strong momentum today!`;
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.json({ brief: localDailyBrief() });
      return;
    }

    const pendingTasks = (tasks || []).filter((t: any) => t.status !== 'Completed');
    const result = await generateWithFallback(
      ai,
      `Generate an energizing, concise 2-sentence morning productivity briefing for ${userName}.
Pending Tasks (${pendingTasks.length}): ${pendingTasks.map((t: any) => `"${t.title}" (${t.priority})`).join(', ')}.
Total recent notes: ${(notes || []).length}. Total tracked expenses: ${(expenses || []).length}.`,
      {
        systemInstruction: 'You are LifeDesk AI, a positive, world-class executive coach.',
      },
      STANDARD_MODEL_CHAIN
    );

    res.json({
      brief: result.text.trim() || localDailyBrief(),
    });
  } catch (error: any) {
    console.warn('Gemini API call in /api/ai/daily-brief encountered error, using local daily brief:', error?.message);
    res.json({
      brief: localDailyBrief(),
    });
  }
});

// Fallback logic when Gemini API key is not configured
function generateFallbackChatResponse(message: string, context: any): string {
  const lower = message.toLowerCase();
  const tasks = context?.tasks || [];
  const expenses = context?.expenses || [];

  if (lower.includes('task') || lower.includes('pending') || lower.includes('deadline')) {
    const pending = tasks.filter((t: any) => t.status !== 'Completed');
    if (pending.length === 0) return 'You have no pending tasks right now. Great job!';
    return `You have **${pending.length} pending tasks** in your database:\n${pending
      .map((t: any) => `• **${t.title}** (${t.priority} priority, due ${t.due_date || 'soon'})`)
      .join('\n')}`;
  }

  if (lower.includes('spend') || lower.includes('expense') || lower.includes('cost') || lower.includes('money')) {
    const total = expenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
    return `According to your expense records, your total spending is **$${total.toFixed(2)}** across ${expenses.length} tracked items.`;
  }

  return `I have reviewed your request. You have ${tasks.length} tasks and ${expenses.length} expense items stored in your LifeDesk database. Let me know if you would like me to prioritize your tasks or analyze your spending!`;
}

// ----------------------------------------------------
// Vite Middleware / Static Serving Setup
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const networkInterfaces = os.networkInterfaces();
    const addresses: string[] = [];

    Object.values(networkInterfaces).forEach((iface) => {
      if (!iface) return;
      iface.forEach((addr) => {
        if (addr.family === 'IPv4' && !addr.internal) {
          addresses.push(addr.address);
        }
      });
    });

    console.log(`\n🚀 LifeDesk AI Server running on port ${PORT}`);
    console.log(`\n📱 Local Network Access (mobile, other devices):`);
    addresses.forEach((addr) => {
      console.log(`   http://${addr}:${PORT}`);
    });
    console.log(`\n💻 Localhost Access:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    console.log('\n────────────────────────────────────────────\n');
  });
}

startServer();
