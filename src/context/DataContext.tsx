import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  TaskCategory,
  TaskRecurrence,
  Priority,
  TaskStatus,
  Note,
  Expense,
  DocumentItem,
  ChatMessage,
  ToastMessage,
} from '../types';
import { useAuth } from './AuthContext';
import { getSupabaseClient, isSupabaseConfigured, generateUUID } from '../lib/supabase';
import { INITIAL_TASKS, INITIAL_EXPENSES } from '../lib/seedData';

interface DataContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTask: (id: string) => Promise<boolean>;
  prioritizeTasksAI: () => Promise<string>;
  getAIPrioritizationSuggestions: () => Promise<string[]>;
  suggestTasksAI: () => Promise<Array<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>>;
  createTaskFromNaturalLanguage: (prompt: string) => Promise<Task | null>;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  summarizeNoteAI: (noteOrId: Note | string) => Promise<string>;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  getExpenseInsightsAI: () => Promise<string>;
  totalMonthlySpend: number;
  totalAllTimeSpend: number;
  highestSpendingCategory: { category: string; amount: number; percentage: number };

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  summarizeDocumentAI: (doc: DocumentItem) => Promise<string>;
  askDocumentQAAI: (doc: DocumentItem, question: string) => Promise<string>;

  // Chatbot
  chatMessages: ChatMessage[];
  sendChatMessage: (message: string, useThinking?: boolean) => Promise<string>;
  sendMessageToAI: (message: string, useThinking?: boolean) => Promise<string>;
  clearChatHistory: () => Promise<void>;
  isAILoading: boolean;

  // Daily Brief
  dailyBrief: string;
  refreshDailyBrief: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Loading & Sync
  isDataLoading: boolean;
  refreshUserData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dailyBrief, setDailyBrief] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifedesk_theme');
      return saved === 'dark';
    }
    return false;
  });

  // Apply dark mode class to HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('lifedesk_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('lifedesk_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Show Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load user-specific data whenever user changes
  const loadUserData = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setNotes([]);
      setExpenses([]);
      setDocuments([]);
      setChatMessages([]);
      return;
    }

    setIsDataLoading(true);
    const supabase = getSupabaseClient();
    const isCloud = isSupabaseConfigured();

    if (supabase && isCloud) {
      try {
        const [tasksRes, notesRes, expRes, docsRes, chatRes] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('expenses').select('*').eq('user_id', userId).order('expense_date', { ascending: false }),
          supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('chat_history').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        ]);

        const rawTasks = tasksRes.data || [];
        const loadedTasks: Task[] = rawTasks.length > 0
          ? rawTasks.map((t: any) => ({
              ...t,
              category: t.category || 'Other',
              recurrence: t.recurrence || 'None',
              completed: t.status === 'Completed',
            }))
          : INITIAL_TASKS;

        setTasks(loadedTasks);
        setNotes((notesRes.data || []).map((n: any) => ({ ...n, body: n.content })));
        setExpenses((expRes.data || []).map((e: any) => ({ ...e, date: e.expense_date })));
        setDocuments((docsRes.data || []).map((d: any) => ({ ...d, name: d.file_name })));
        setChatMessages(chatRes.data || []);
        setIsDataLoading(false);
        return;
      } catch (err) {
        console.warn('Error fetching user data from Supabase:', err);
      }
    }

    // LocalStorage user-isolated storage
    try {
      const storedTasks = localStorage.getItem(`lifedesk_tasks_${userId}`);
      const storedNotes = localStorage.getItem(`lifedesk_notes_${userId}`);
      const storedExpenses = localStorage.getItem(`lifedesk_expenses_${userId}`);
      const storedDocs = localStorage.getItem(`lifedesk_docs_${userId}`);
      const storedChat = localStorage.getItem(`lifedesk_chat_${userId}`);

      if (storedTasks) {
        const parsed: Task[] = JSON.parse(storedTasks).map((t: any) => ({
          ...t,
          category: t.category || 'Other',
          recurrence: t.recurrence || 'None',
          completed: t.status === 'Completed',
        }));
        if (parsed.length > 0) {
          // Merge any new seed tasks that don't already exist (by id)
          const existingIds = new Set(parsed.map((t) => t.id));
          const newSeedTasks = INITIAL_TASKS.filter((t) => !existingIds.has(t.id));
          setTasks(newSeedTasks.length > 0 ? [...newSeedTasks, ...parsed] : parsed);
        } else {
          setTasks(INITIAL_TASKS);
        }
      } else {
        setTasks(INITIAL_TASKS);
      }

      setNotes(
        storedNotes
          ? JSON.parse(storedNotes).map((n: any) => ({ ...n, body: n.content }))
          : []
      );

      // Merge new seed expenses if none stored, or if stored is empty
      if (storedExpenses) {
        const parsedExp = JSON.parse(storedExpenses).map((e: any) => ({ ...e, date: e.expense_date }));
        if (parsedExp.length > 0) {
          setExpenses(parsedExp);
        } else {
          setExpenses(INITIAL_EXPENSES.map((e) => ({ ...e, date: e.expense_date })));
        }
      } else {
        setExpenses(INITIAL_EXPENSES.map((e) => ({ ...e, date: e.expense_date })));
      }

      setDocuments(
        storedDocs
          ? JSON.parse(storedDocs).map((d: any) => ({ ...d, name: d.file_name }))
          : []
      );
      setChatMessages(storedChat ? JSON.parse(storedChat) : []);
    } catch (e) {
      console.warn('Error reading from local cache:', e);
      setTasks(INITIAL_TASKS);
    }
    setIsDataLoading(false);
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Sync to local user cache for offline resilience
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`lifedesk_tasks_${userId}`, JSON.stringify(tasks));
    }
  }, [tasks, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`lifedesk_notes_${userId}`, JSON.stringify(notes));
    }
  }, [notes, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`lifedesk_expenses_${userId}`, JSON.stringify(expenses));
    }
  }, [expenses, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`lifedesk_docs_${userId}`, JSON.stringify(documents));
    }
  }, [documents, userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`lifedesk_chat_${userId}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, userId]);

  // Task Actions
  const addTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!userId) {
      showToast('You must be signed in to create tasks', 'error');
      return false;
    }

    const newId = generateUUID();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: newId,
      user_id: userId,
      category: taskData.category || 'Other',
      recurrence: taskData.recurrence || 'None',
      completed: taskData.status === 'Completed' || Boolean(taskData.completed),
      status: taskData.status || (taskData.completed ? 'Completed' : 'Pending'),
      created_at: now,
      updated_at: now,
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('tasks').insert({
          id: newId,
          user_id: userId,
          title: newTask.title.trim(),
          description: newTask.description?.trim() || '',
          priority: newTask.priority,
          status: newTask.status || 'Pending',
          due_date: newTask.due_date ? newTask.due_date : null,
          created_at: newTask.created_at,
          updated_at: newTask.updated_at,
        }).select().single();

        if (error) {
          console.error('Supabase task insert error:', error);
          showToast(`Error saving task: ${error.message}`, 'error');
          return false;
        }

        const savedTask: Task = {
          ...(data || newTask),
          category: newTask.category,
          recurrence: newTask.recurrence,
          completed: newTask.status === 'Completed',
        };
        setTasks((prev) => [savedTask, ...prev]);
        showToast(`Task "${savedTask.title}" created`, 'success');
        return true;
      } catch (e: any) {
        console.error('Supabase task insert failed:', e);
        showToast(`Error: ${e?.message || 'Failed to save task'}`, 'error');
        return false;
      }
    }

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" created`, 'success');
    return true;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<boolean> => {
    if (!userId) {
      showToast('You must be signed in to update tasks', 'error');
      return false;
    }

    const now = new Date().toISOString();
    const previousTasks = [...tasks];

    const computedStatus: TaskStatus | undefined =
      updates.status !== undefined
        ? updates.status
        : updates.completed !== undefined
        ? (updates.completed ? 'Completed' : 'Pending')
        : undefined;

    const normalizedUpdates = {
      ...updates,
      ...(computedStatus ? { status: computedStatus, completed: computedStatus === 'Completed' } : {}),
      updated_at: now,
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...normalizedUpdates } : t))
    );

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const dbUpdates: any = { updated_at: now };
        if (computedStatus) dbUpdates.status = computedStatus;
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if ('due_date' in updates) {
          dbUpdates.due_date = updates.due_date ? updates.due_date : null;
        }

        const { error } = await supabase
          .from('tasks')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase task update error:', error);
          showToast(`Failed to update task: ${error.message}`, 'error');
          setTasks(previousTasks);
          return false;
        }
        showToast('Task updated', 'info');
        return true;
      } catch (e: any) {
        console.error('Supabase task update error:', e);
        showToast('Network error while updating task', 'error');
        setTasks(previousTasks);
        return false;
      }
    }

    showToast('Task updated', 'info');
    return true;
  };

  const toggleTask = async (id: string): Promise<boolean> => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return false;
    const isNowCompleted = target.status !== 'Completed';
    const newStatus: TaskStatus = isNowCompleted ? 'Completed' : 'Pending';

    if (isNowCompleted) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // ignore
      }
    }

    return updateTask(id, {
      status: newStatus,
      completed: isNowCompleted,
    });
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    if (!userId) {
      showToast('You must be signed in to delete tasks', 'error');
      return false;
    }

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase task delete error:', error);
          showToast(`Failed to delete task: ${error.message}`, 'error');
          setTasks(previousTasks);
          return false;
        }
        showToast('Task removed', 'warning');
        return true;
      } catch (e: any) {
        console.error('Supabase task delete error:', e);
        showToast('Network error while deleting task', 'error');
        setTasks(previousTasks);
        return false;
      }
    }

    showToast('Task removed', 'warning');
    return true;
  };

  const prioritizeTasksAI = async (): Promise<string> => {
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/prioritize-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      setIsAILoading(false);
      return data.recommendation || 'Focus on pending high-priority deadlines.';
    } catch {
      setIsAILoading(false);
      return 'Prioritize high-priority items due soonest first.';
    }
  };

  const getAIPrioritizationSuggestions = async (): Promise<string[]> => {
    try {
      const raw = await prioritizeTasksAI();
      const lines = raw
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter((l) => l.length > 5 && !l.startsWith('#'));
      return lines.length > 0
        ? lines.slice(0, 5)
        : [
            'Prioritize College & Study high-impact assignments first.',
            'Tackle "Complete Java assignment" and coding challenges early.',
            'Schedule routine tasks like file cleanup for later in the evening.',
          ];
    } catch {
      return [
        'Complete top high-priority tasks due today.',
        'Batch 30-minute focus blocks for coding and study.',
        'Review recent lecture notes to solidify retention.',
      ];
    }
  };

  const suggestTasksAI = async (): Promise<Array<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const candidatePool: Array<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = [
      {
        title: 'Practice Python for 30 minutes',
        category: 'Study',
        priority: 'Medium',
        status: 'Pending',
        recurrence: 'Daily',
        due_date: todayStr,
        description: 'Solve 2 LeetCode problems focusing on arrays and hash maps.',
      },
      {
        title: 'Submit lab record',
        category: 'College',
        priority: 'High',
        status: 'Pending',
        recurrence: 'None',
        due_date: todayStr,
        description: 'Get faculty verification and submit lab record copy.',
      },
      {
        title: 'Check internship emails',
        category: 'Career',
        priority: 'Low',
        status: 'Pending',
        recurrence: 'Daily',
        due_date: todayStr,
        description: 'Track responses for Software Engineering Intern postings.',
      },
      {
        title: 'Morning walk',
        category: 'Health & Routine',
        priority: 'Medium',
        status: 'Pending',
        recurrence: 'Daily',
        due_date: todayStr,
        description: '30-minute brisk walk and morning fresh air.',
      },
      {
        title: 'Clean study table',
        category: 'Personal',
        priority: 'Low',
        status: 'Pending',
        recurrence: 'Weekly',
        due_date: todayStr,
        description: 'Declutter study space for focused revision.',
      },
      {
        title: 'Read for 20 minutes',
        category: 'Health & Routine',
        priority: 'Low',
        status: 'Pending',
        recurrence: 'Daily',
        due_date: todayStr,
        description: 'Read technical engineering or personal growth book.',
      },
      {
        title: "Review today's notes",
        category: 'Study',
        priority: 'Medium',
        status: 'Pending',
        recurrence: 'Daily',
        due_date: todayStr,
        description: 'Summarize today’s lecture topics into key bullet points.',
      },
      {
        title: 'Organize laptop files',
        category: 'Personal',
        priority: 'Low',
        status: 'Pending',
        recurrence: 'Weekly',
        due_date: todayStr,
        description: 'Clear Desktop and sort Downloads folder.',
      },
    ];

    const existingTitles = new Set(tasks.map((t) => t.title.toLowerCase().trim()));
    const unadded = candidatePool.filter((c) => !existingTitles.has(c.title.toLowerCase().trim()));
    return unadded.length > 0 ? unadded.slice(0, 4) : candidatePool.slice(0, 3);
  };

  const createTaskFromNaturalLanguage = async (prompt: string): Promise<Task | null> => {
    const p = prompt.trim();
    if (!p || !userId) return null;

    let title = p;
    let category: TaskCategory = 'Personal';
    let priority: Priority = 'Medium';
    let recurrence: TaskRecurrence = 'None';
    let dueDate: string = new Date().toISOString().split('T')[0];

    const lower = p.toLowerCase();

    // 1. Recurrence
    if (lower.includes('every day') || lower.includes('daily')) {
      recurrence = 'Daily';
    } else if (
      lower.includes('every week') ||
      lower.includes('weekly') ||
      lower.includes('every monday') ||
      lower.includes('every sunday')
    ) {
      recurrence = 'Weekly';
    } else if (lower.includes('every month') || lower.includes('monthly')) {
      recurrence = 'Monthly';
    }

    // 2. Due Date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (lower.includes('tomorrow')) {
      dueDate = tomorrow.toISOString().split('T')[0];
    } else if (lower.includes('next week')) {
      const nextWk = new Date();
      nextWk.setDate(nextWk.getDate() + 7);
      dueDate = nextWk.toISOString().split('T')[0];
    }

    // 3. Category detection
    if (
      lower.includes('java') ||
      lower.includes('python') ||
      lower.includes('coding') ||
      lower.includes('study') ||
      lower.includes('exam') ||
      lower.includes('notes') ||
      lower.includes('book') ||
      lower.includes('chapter')
    ) {
      category = 'Study';
    }
    if (
      lower.includes('college') ||
      lower.includes('assignment') ||
      lower.includes('lab') ||
      lower.includes('professor') ||
      lower.includes('class') ||
      lower.includes('lecture')
    ) {
      category = 'College';
    }
    if (
      lower.includes('internship') ||
      lower.includes('resume') ||
      lower.includes('interview') ||
      lower.includes('career') ||
      lower.includes('job') ||
      lower.includes('apply')
    ) {
      category = 'Career';
    }
    if (
      lower.includes('walk') ||
      lower.includes('exercise') ||
      lower.includes('workout') ||
      lower.includes('health') ||
      lower.includes('water') ||
      lower.includes('gym') ||
      lower.includes('sleep') ||
      lower.includes('routine')
    ) {
      category = 'Health & Routine';
    }
    if (
      lower.includes('buy') ||
      lower.includes('grocery') ||
      lower.includes('groceries') ||
      lower.includes('shopping') ||
      lower.includes('order')
    ) {
      category = 'Shopping';
    }
    if (
      lower.includes('project') ||
      lower.includes('app') ||
      lower.includes('build') ||
      lower.includes('deploy') ||
      lower.includes('feature')
    ) {
      category = 'Projects';
    }
    if (
      lower.includes('bill') ||
      lower.includes('recharge') ||
      lower.includes('tax') ||
      lower.includes('pay')
    ) {
      category = 'Other';
    }
    if (
      lower.includes('winter arc') ||
      lower.includes('cold shower') ||
      lower.includes('wake up 5') ||
      lower.includes('wake up at 5') ||
      lower.includes('no phone') ||
      lower.includes('deep work') ||
      lower.includes('discipline') ||
      lower.includes('dopamine') ||
      lower.includes('90 day') ||
      lower.includes('90-day')
    ) {
      category = 'Winter Arc';
    }

    // 4. Priority
    if (
      lower.includes('urgent') ||
      lower.includes('important') ||
      lower.includes('asap') ||
      lower.includes('critical') ||
      lower.includes('high priority')
    ) {
      priority = 'High';
    } else if (lower.includes('low priority') || lower.includes('whenever') || lower.includes('someday')) {
      priority = 'Low';
    }

    // 5. Clean Title
    const cleaned = p
      .replace(
        /^(remind me to|i need to|i have to|please remind me to|tomorrow i need to|every monday remind me to|set a task to|add a task to)\s+/i,
        ''
      )
      .replace(/\s+(tomorrow|today|every monday|every day|daily|weekly)$/i, '')
      .trim();
    if (cleaned.length > 0) {
      title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    const newTaskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title,
      description: `Created via LifeDesk AI Natural Language Engine ("${prompt}")`,
      category,
      priority,
      status: 'Pending',
      due_date: dueDate,
      recurrence,
      completed: false,
    };

    const success = await addTask(newTaskData);
    if (success) {
      return {
        id: generateUUID(),
        user_id: userId,
        ...newTaskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return null;
  };

  // Note Actions
  const addNote = async (noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!userId) {
      showToast('You must be signed in to save notes', 'error');
      return false;
    }

    const newId = generateUUID();
    const now = new Date().toISOString();
    const content = noteData.content || (noteData as any).body || '';
    const newNote: Note = {
      ...noteData,
      id: newId,
      user_id: userId,
      content,
      body: content,
      created_at: now,
      updated_at: now,
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('notes').insert({
          id: newId,
          user_id: userId,
          title: newNote.title.trim(),
          content: newNote.content.trim(),
          ai_summary: newNote.ai_summary || '',
          created_at: newNote.created_at,
          updated_at: newNote.updated_at,
        }).select().single();

        if (error) {
          console.error('Supabase note insert error:', error);
          showToast(`Error saving note: ${error.message}`, 'error');
          return false;
        }

        const savedNote: Note = { ...(data || newNote), body: newNote.content };
        setNotes((prev) => [savedNote, ...prev]);
        showToast(`Note "${savedNote.title}" saved`, 'success');
        return true;
      } catch (e: any) {
        console.error('Supabase note insert failed:', e);
        showToast(`Error: ${e?.message || 'Failed to save note'}`, 'error');
        return false;
      }
    }

    setNotes((prev) => [newNote, ...prev]);
    showToast(`Note "${newNote.title}" saved`, 'success');
    return true;
  };

  const updateNote = async (id: string, updates: Partial<Note>): Promise<boolean> => {
    if (!userId) {
      showToast('You must be signed in to update notes', 'error');
      return false;
    }

    const now = new Date().toISOString();
    const previousNotes = [...notes];
    const content = updates.content || updates.body;
    const computedUpdates = {
      ...updates,
      ...(content !== undefined ? { content, body: content } : {}),
      updated_at: now,
    };

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...computedUpdates } : n))
    );

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const dbUpdates: any = { updated_at: now };
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (content !== undefined) dbUpdates.content = content;
        if (updates.ai_summary !== undefined) dbUpdates.ai_summary = updates.ai_summary;

        const { error } = await supabase
          .from('notes')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase note update error:', error);
          showToast(`Failed to update note: ${error.message}`, 'error');
          setNotes(previousNotes);
          return false;
        }
        showToast('Note updated', 'info');
        return true;
      } catch (e: any) {
        console.error('Supabase note update error:', e);
        showToast('Network error while updating note', 'error');
        setNotes(previousNotes);
        return false;
      }
    }

    showToast('Note updated', 'info');
    return true;
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    if (!userId) {
      showToast('You must be signed in to delete notes', 'error');
      return false;
    }

    const previousNotes = [...notes];
    setNotes((prev) => prev.filter((n) => n.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase note delete error:', error);
          showToast(`Failed to delete note: ${error.message}`, 'error');
          setNotes(previousNotes);
          return false;
        }
        showToast('Note deleted', 'warning');
        return true;
      } catch (e: any) {
        console.error('Supabase note delete error:', e);
        showToast('Network error while deleting note', 'error');
        setNotes(previousNotes);
        return false;
      }
    }

    showToast('Note deleted', 'warning');
    return true;
  };

  const summarizeNoteAI = async (noteOrId: Note | string): Promise<string> => {
    const note = typeof noteOrId === 'string' ? notes.find((n) => n.id === noteOrId) : noteOrId;
    if (!note) return 'Note not found';
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/summarize-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: note.title,
          content: note.content || note.body || 'Note content',
        }),
      });
      const data = await res.json();
      setIsAILoading(false);
      const summary = data.summary || 'Summary unavailable.';
      updateNote(note.id, { ai_summary: summary });
      return summary;
    } catch {
      setIsAILoading(false);
      return `${(note.content || note.body || '').slice(0, 150)}...`;
    }
  };

  // Expense Actions
  const addExpense = async (
    expData: Omit<Expense, 'id' | 'user_id' | 'created_at'>
  ): Promise<boolean> => {
    if (!userId) {
      showToast('Please sign in to record expenses', 'error');
      return false;
    }

    const title = expData.title || expData.description || 'Expense';
    const expense_date =
      expData.expense_date || (expData as any).date || new Date().toISOString().split('T')[0];

    const newExp: Expense = {
      ...expData,
      title,
      expense_date,
      date: expense_date,
      id: generateUUID(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('expenses').insert({
          id: newExp.id,
          user_id: userId,
          title: newExp.title,
          amount: newExp.amount,
          category: newExp.category,
          expense_date: newExp.expense_date,
          description: newExp.description || '',
          created_at: newExp.created_at,
        });

        if (error) {
          console.error('Supabase expense insert error:', error);
          showToast(`Database error: ${error.message}`, 'error');
          return false;
        }
      } catch (e: any) {
        console.warn('Supabase expense insert exception:', e);
        showToast(`Failed to save expense: ${e.message || 'Network error'}`, 'error');
        return false;
      }
    }

    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Recorded "${newExp.title}" (${Number(newExp.amount).toFixed(2)})`, 'success');
    return true;
  };

  const updateExpense = async (
    id: string,
    updates: Partial<Expense>
  ): Promise<boolean> => {
    if (!userId) {
      showToast('Please sign in to edit expenses', 'error');
      return false;
    }

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('expenses')
          .update({
            ...(updates.title !== undefined && { title: updates.title }),
            ...(updates.amount !== undefined && { amount: updates.amount }),
            ...(updates.category !== undefined && { category: updates.category }),
            ...(updates.expense_date !== undefined && { expense_date: updates.expense_date }),
            ...(updates.description !== undefined && { description: updates.description }),
          })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase expense update error:', error);
          showToast(`Database error: ${error.message}`, 'error');
          return false;
        }
      } catch (e: any) {
        console.warn('Supabase expense update exception:', e);
        showToast(`Failed to update expense: ${e.message || 'Network error'}`, 'error');
        return false;
      }
    }

    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    showToast('Expense updated successfully', 'success');
    return true;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    if (!userId) {
      showToast('Please sign in to delete expenses', 'error');
      return false;
    }

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase expense delete error:', error);
          showToast(`Database error: ${error.message}`, 'error');
          return false;
        }
      } catch (e: any) {
        console.warn('Supabase expense delete exception:', e);
        showToast(`Failed to delete expense: ${e.message || 'Network error'}`, 'error');
        return false;
      }
    }

    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense removed from database', 'info');
    return true;
  };

  const getExpenseInsightsAI = async (): Promise<string> => {
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/expense-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses }),
      });
      const data = await res.json();
      setIsAILoading(false);
      return data.insights || 'Spending insights generated.';
    } catch {
      setIsAILoading(false);
      return `Current monthly spending is ${totalMonthlySpend.toFixed(2)}. Highest category is ${highestSpendingCategory.category} (${highestSpendingCategory.amount.toFixed(2)}).`;
    }
  };

  // Current calendar month spending (YYYY-MM)
  const totalMonthlySpend = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses
      .filter((e) => e.expense_date && e.expense_date.startsWith(currentYearMonth))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [expenses]);

  // All-time aggregate spending
  const totalAllTimeSpend = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [expenses]);

  const highestSpendingCategory = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    expenses.forEach((e) => {
      const amt = Number(e.amount || 0);
      map[e.category] = (map[e.category] || 0) + amt;
      total += amt;
    });

    let topCat = 'None';
    let topAmt = 0;
    Object.entries(map).forEach(([cat, amt]) => {
      if (amt > topAmt) {
        topCat = cat;
        topAmt = amt;
      }
    });

    const percentage = total > 0 ? (topAmt / total) * 100 : 0;
    return { category: topCat, amount: topAmt, percentage };
  }, [expenses]);

  // Document Actions
  const addDocument = async (docData: Omit<DocumentItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;

    const newDoc: DocumentItem = {
      ...docData,
      id: generateUUID(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Document "${newDoc.file_name}" uploaded`, 'success');

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('documents').insert({
          id: newDoc.id,
          user_id: userId,
          file_name: newDoc.file_name,
          file_url: newDoc.file_url,
          file_type: newDoc.file_type,
          file_size: newDoc.file_size || 0,
          text_content: newDoc.text_content || '',
          summary: newDoc.summary || '',
          created_at: newDoc.created_at,
        });
      } catch (e) {
        console.warn('Supabase document insert error:', e);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    if (!userId) return;

    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Document deleted', 'warning');

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('documents').delete().eq('id', id).eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase document delete error:', e);
      }
    }
  };

  const uploadDocument = async (file: File): Promise<void> => {
    const textContent = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      if (
        file.type.includes('text') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.json') ||
        file.name.endsWith('.txt')
      ) {
        reader.readAsText(file);
      } else {
        resolve(`Binary file ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    });

    await addDocument({
      file_name: file.name,
      name: file.name,
      file_url: URL.createObjectURL(file),
      file_type: file.type || 'application/octet-stream',
      file_size: file.size,
      text_content: textContent,
      summary: `Uploaded file ${file.name}. Size: ${(file.size / 1024).toFixed(1)} KB.`,
    });
  };

  const summarizeDocumentAI = async (doc: DocumentItem): Promise<string> => {
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: doc.file_name,
          documentContent: doc.text_content || doc.summary || 'Executive document',
          isSummary: true,
        }),
      });
      const data = await res.json();
      setIsAILoading(false);
      const summary = data.answer || 'Summary generated.';
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, summary } : d)));
      return summary;
    } catch {
      setIsAILoading(false);
      return doc.summary || 'Summary unavailable.';
    }
  };

  const askDocumentQAAI = async (doc: DocumentItem, question: string): Promise<string> => {
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: doc.file_name,
          documentContent: doc.text_content || doc.summary || 'Executive document',
          question,
          isSummary: false,
        }),
      });
      const data = await res.json();
      setIsAILoading(false);
      return data.answer || 'Document answered.';
    } catch {
      setIsAILoading(false);
      return 'Unable to analyze document at this time.';
    }
  };

  // Chat Actions
  const sendChatMessage = async (message: string, useThinking = false): Promise<string> => {
    if (!userId) return 'Please log in to chat with LifeDesk AI.';

    setIsAILoading(true);
    const msgId = generateUUID();
    const tempUserMsg: ChatMessage = {
      id: msgId,
      user_id: userId,
      message,
      response: '...',
      created_at: new Date().toISOString(),
      thinking_used: useThinking,
      status: 'pending',
    };

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          useThinking,
          context: {
            userId,
            profile: user,
            tasks,
            notes,
            expenses,
            documents,
          },
        }),
      });

      const data = await res.json();
      const aiReply = data.response || 'I processed your request.';
      const completedMsg: ChatMessage = {
        ...tempUserMsg,
        response: aiReply,
        thinking_used: data.thinkingUsed || useThinking,
        intent: data.intent || undefined,
        status: 'complete',
      };

      setChatMessages((prev) => [...prev, completedMsg]);
      setIsAILoading(false);

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        try {
          await supabase.from('chat_history').insert({
            id: completedMsg.id,
            user_id: userId,
            message: completedMsg.message,
            response: completedMsg.response,
            created_at: completedMsg.created_at,
          });
        } catch (e) {
          console.warn('Supabase chat insert error:', e);
        }
      }

      return aiReply;
    } catch (err: any) {
      setIsAILoading(false);
      const fallbackReply = `I experienced an error connecting to AI services: ${err?.message || 'Server error'}. Please verify your connection or try again.`;
      const completedMsg: ChatMessage = {
        ...tempUserMsg,
        response: fallbackReply,
        status: 'error',
      };
      setChatMessages((prev) => [...prev, completedMsg]);
      return fallbackReply;
    }
  };

  const clearChatHistory = async () => {
    if (!userId) return;

    setChatMessages([]);
    localStorage.removeItem(`lifedesk_chat_${userId}`);
    showToast('Chat history cleared', 'info');

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('chat_history').delete().eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase chat clear error:', e);
      }
    }
  };

  // Daily Briefing
  const refreshDailyBrief = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/ai/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          notes,
          expenses,
          userName: user.full_name?.split(' ')[0] || 'there',
        }),
      });
      const data = await res.json();
      if (data.brief) setDailyBrief(data.brief);
    } catch {
      const pending = tasks.filter((t) => t.status !== 'Completed');
      setDailyBrief(`Welcome, ${user.full_name?.split(' ')[0]}! You have ${pending.length} active tasks in your personal workspace.`);
    }
  }, [tasks, notes, expenses, user]);

  useEffect(() => {
    if (user && tasks.length > 0) {
      refreshDailyBrief();
    }
  }, [tasks.length, user, refreshDailyBrief]);

  return (
    <DataContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        prioritizeTasksAI,
        getAIPrioritizationSuggestions,
        suggestTasksAI,
        createTaskFromNaturalLanguage,
        notes,
        addNote,
        updateNote,
        deleteNote,
        summarizeNoteAI,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpenseInsightsAI,
        totalMonthlySpend,
        totalAllTimeSpend,
        highestSpendingCategory,
        documents,
        addDocument,
        uploadDocument,
        deleteDocument,
        summarizeDocumentAI,
        askDocumentQAAI,
        chatMessages,
        sendChatMessage,
        sendMessageToAI: sendChatMessage,
        clearChatHistory,
        isAILoading,
        dailyBrief,
        refreshDailyBrief,
        toasts,
        showToast,
        removeToast,
        isDarkMode,
        toggleTheme,
        isDataLoading,
        refreshUserData: loadUserData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
