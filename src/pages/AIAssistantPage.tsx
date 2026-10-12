import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Mic, MicOff, Sparkles, ChevronDown, Bot, Copy, RotateCcw, Search, BookOpen,
  Zap, Brain, CheckSquare, ArrowRight, CheckCircle2, Calendar, Tag
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CreatorProfileCard } from '../components/chat/CreatorProfileCard';
import { ThreeAIOrb } from '../components/3d/ThreeAIOrb';
import ReactMarkdown from 'react-markdown';
import { CREATOR_CONFIG, getCreatorPhoto, isCreatorQuery } from '../config/creatorConfig';
import { getKnownChatbotAnswer } from '../config/chatbotKnowledge';
import { CHATBOT_QUESTION_BANK } from '../config/questionBank';
import type { Task, TaskCategory, Priority } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  taskPreview?: {
    title: string;
    category: TaskCategory;
    priority: Priority;
    due_date: string;
    recurrence?: string;
  };
  taskAdded?: boolean;
  creatorProfile?: boolean;
}

const SUGGESTED_PROMPTS = [
  'What tasks do I have scheduled for today?',
  'Give me an actionable Eisenhower Matrix prioritization',
  'How much did I spend this month and what is my top category?',
  'Who is the creator of this website?',
  'How do I add a task?',
  'How can I summarize my notes?',
];

const TypingDots: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
);

export const AIAssistantPage: React.FC = () => {
  const { sendMessageToAI, isAILoading, addTask, createTaskFromNaturalLanguage } = useData();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionCategory, setQuestionCategory] = useState('All topics');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAILoading]);

  // Helper to detect if user prompt implies a task to extract
  const parseTaskFromPrompt = (prompt: string) => {
    const lower = prompt.toLowerCase();
    const isTaskIntent =
      lower.includes('tomorrow i need to') ||
      lower.includes('remind me to') ||
      lower.includes('i need to') ||
      lower.includes('i have to') ||
      lower.includes('add a task') ||
      lower.includes('create a task') ||
      lower.includes('every monday') ||
      lower.includes('every day') ||
      lower.includes('daily');

    if (!isTaskIntent) return undefined;

    let category: TaskCategory = 'Personal';
    if (lower.includes('java') || lower.includes('python') || lower.includes('coding') || lower.includes('study')) {
      category = 'Study';
    }
    if (lower.includes('college') || lower.includes('assignment') || lower.includes('lab') || lower.includes('class')) {
      category = 'College';
    }
    if (lower.includes('internship') || lower.includes('resume') || lower.includes('job') || lower.includes('interview')) {
      category = 'Career';
    }
    if (lower.includes('walk') || lower.includes('exercise') || lower.includes('routine')) {
      category = 'Health & Routine';
    }
    if (lower.includes('buy') || lower.includes('grocery')) {
      category = 'Shopping';
    }
    if (lower.includes('project')) {
      category = 'Projects';
    }

    let priority: Priority = 'Medium';
    if (lower.includes('urgent') || lower.includes('important') || lower.includes('asap')) {
      priority = 'High';
    }

    let dueDate = new Date().toISOString().split('T')[0];
    if (lower.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    }

    let recurrence = 'None';
    if (lower.includes('every monday') || lower.includes('weekly')) recurrence = 'Weekly';
    if (lower.includes('daily') || lower.includes('every day')) recurrence = 'Daily';

    let cleaned = prompt
      .replace(/^(remind me to|i need to|i have to|tomorrow i need to|every monday remind me to|please remind me to|add a task to)\s+/i, '')
      .replace(/\s+(tomorrow|today|every monday|every day|daily|weekly)$/i, '')
      .trim();

    return {
      title: cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : 'New Task',
      category,
      priority,
      due_date: dueDate,
      recurrence,
    };
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isAILoading) return;

    const taskPreview = parseTaskFromPrompt(trimmed);
    const creatorProfile = isCreatorQuery(trimmed);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      taskPreview,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const reply = getKnownChatbotAnswer(trimmed) ?? await sendMessageToAI(trimmed, useThinking);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply ?? 'I processed your request.',
          timestamp: new Date(),
          creatorProfile,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handle1ClickAddTask = async (msgId: string, taskData: NonNullable<Message['taskPreview']>) => {
    await addTask({
      title: taskData.title,
      category: taskData.category,
      priority: taskData.priority,
      status: 'Pending',
      due_date: taskData.due_date,
      recurrence: taskData.recurrence as any,
      description: 'Extracted directly from AI Assistant conversation.',
      completed: false,
    });

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, taskAdded: true } : m))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev: any) => {
      setInput(ev.results[0][0].transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const copyMsg = (id: string, content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const userInitial = user?.full_name?.charAt(0) ?? user?.email?.charAt(0) ?? 'U';
  const questionCategories = ['All topics', ...new Set(CHATBOT_QUESTION_BANK.map(({ category }) => category))];
  const matchingQuestions = CHATBOT_QUESTION_BANK.filter(({ category, question }) => {
    const matchesCategory = questionCategory === 'All topics' || category === questionCategory;
    const matchesSearch = `${category} ${question}`.toLowerCase().includes(questionSearch.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  }).slice(0, 8);

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-4xl mx-auto px-2 sm:px-4 pb-4">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* Top Header Bar with Mode Controls & Creator attribution     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-3 border-b border-white/10 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">LifeDesk AI</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                3D Neural Orb Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded, database-aware assistant with thinking mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Thinking Mode Toggle */}
          <button
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              useThinking
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/15'
                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Gemini Thinking Mode"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thinking Mode:</span> {useThinking ? 'ON' : 'OFF'}
          </button>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            Creator
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showProfile ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {showProfile && (
        <div className="py-3 shrink-0">
          <CreatorProfileCard compact={false} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* Interactive 3D AI Orb Hero (Centered Centerpiece)           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 flex flex-col items-center justify-center pt-2 pb-1">
        <ThreeAIOrb
          state={isAILoading ? 'thinking' : messages.length > 0 ? 'active' : 'idle'}
          size={messages.length > 0 ? 150 : 200}
        />
        {messages.length === 0 && (
          <div className="text-center mt-1 space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Greetings{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              I am your 3D neural copilot. Speak or type to create tasks, prioritize assignments,
              or query your database records.
            </p>
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <section className="shrink-0 rounded-2xl border border-white/10 bg-slate-900/60 p-3" aria-label="Search chatbot questions">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              Question Library
            </h2>
            <span className="text-[10px] text-slate-500">
              {CHATBOT_QUESTION_BANK.length.toLocaleString()} questions
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                value={questionSearch}
                onChange={(event) => setQuestionSearch(event.target.value)}
                placeholder="Search questions..."
                aria-label="Search question library"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
              />
            </label>
            <select
              value={questionCategory}
              onChange={(event) => setQuestionCategory(event.target.value)}
              aria-label="Filter questions by topic"
              className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500/40"
            >
              {questionCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          {(questionSearch || questionCategory !== 'All topics') && (
            <div className="mt-2 flex max-h-28 flex-col gap-1 overflow-y-auto">
              {matchingQuestions.length > 0 ? matchingQuestions.map(({ category, question }) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => send(question)}
                  className="flex items-start justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[11px] text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-cyan-200"
                >
                  <span>{question}</span>
                  <span className="shrink-0 text-[9px] text-slate-600">{category}</span>
                </button>
              )) : (
                <p className="px-2.5 py-2 text-[11px] text-slate-500">No matching questions. Try another search.</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* Chat Messages Stream                                        */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 pt-2">
        {messages.length === 0 && !isAILoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto pt-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/30 text-left text-xs text-slate-300 hover:text-cyan-200 transition-all flex items-start gap-2 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>{p}</span>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1.5 ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900/90 border border-white/10 text-slate-100 shadow-lg'
                }`}
                style={{ backdropFilter: 'blur(16px)' }}
              >
                {msg.creatorProfile && (
                  <img
                    src={getCreatorPhoto(user?.avatar_url)}
                    alt={CREATOR_CONFIG.name}
                    className="mb-3 h-24 w-24 rounded-full border-2 border-violet-400/50 object-cover shadow-lg"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el.src !== CREATOR_CONFIG.photoUrl) {
                        el.src = CREATOR_CONFIG.photoUrl;
                      } else {
                        el.style.display = 'none';
                      }
                    }}
                  />
                )}

                <ReactMarkdown
                  components={{
                    h2: ({ children }) => <h2 className="mb-2 text-base font-semibold">{children}</h2>,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline hover:text-cyan-200">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>

                {/* Structured AI Task Extraction Preview Card */}
                {msg.taskPreview && (
                  <div className="mt-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" /> Structured Task Extracted
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                        {msg.taskPreview.category}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white">{msg.taskPreview.title}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due: {msg.taskPreview.due_date}
                      </span>
                      <span>Priority: {msg.taskPreview.priority}</span>
                      {msg.taskPreview.recurrence !== 'None' && (
                        <span>Repeat: {msg.taskPreview.recurrence}</span>
                      )}
                    </div>

                    {msg.taskAdded ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
                        <CheckCircle2 className="w-4 h-4" /> Added to your Tasks Database!
                      </div>
                    ) : (
                      <button
                        onClick={() => handle1ClickAddTask(msg.id, msg.taskPreview!)}
                        className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1 mt-1"
                      >
                        ✓ Add Task to My LifeDesk Workspace
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                <time>
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </time>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMsg(msg.id, msg.content)}
                    className="hover:text-slate-300"
                    title="Copy message"
                  >
                    {copied === msg.id ? (
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0 text-black font-bold text-xs">
                {userInitial.toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {isAILoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-300 text-xs flex items-center gap-2">
              <span className="text-cyan-400 font-semibold">
                {useThinking ? 'Gemini 3.1 Pro Thinking...' : 'Gemini 3.8 Flash Processing...'}
              </span>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* Bottom Prompt Input Controls                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="pt-3 shrink-0">
        <div className="flex items-end gap-2 p-2 rounded-2xl bg-slate-900/90 border border-white/10 focus-within:border-cyan-500/50 transition-all backdrop-blur-xl">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isAILoading}
            placeholder="Ask anything or create tasks (e.g. 'Tomorrow I need to submit lab record')..."
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-500 resize-none px-2 py-1.5 max-h-32 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 pb-0.5 shrink-0">
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-xl transition-colors ${
                listening
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={listening ? 'Stop voice listening' : 'Start voice input'}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isAILoading}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold disabled:opacity-30 transition-all shadow-md shadow-cyan-500/20"
              title="Send prompt"
            >
              <Send className="w-4 h-4 fill-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
