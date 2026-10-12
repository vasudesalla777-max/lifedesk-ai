export type Priority = 'Low' | 'Medium' | 'High';
export type TaskPriority = Priority;
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type TaskCategory =
  | 'Study'
  | 'College'
  | 'Career'
  | 'Personal'
  | 'Health & Routine'
  | 'Shopping'
  | 'Projects'
  | 'Winter Arc'
  | 'Other';

export type TaskRecurrence = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export type ExpenseCategory =
  | 'Food'
  | 'Rent'
  | 'Travel'
  | 'Education'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Other';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  plan?: string;
  phone?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  category?: TaskCategory;
  recurrence?: TaskRecurrence;
  due_date?: string;
  completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  body?: string;
  created_at: string;
  updated_at: string;
  ai_summary?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  date?: string;
  description: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  file_name: string;
  name?: string;
  file_url: string;
  url?: string;
  file_type: string;
  file_size?: number;
  size?: number;
  text_content?: string;
  summary: string;
  created_at: string;
}

export type Document = DocumentItem;

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
  sources?: string[];
  thinking_used?: boolean;
  intent?: string;
  status?: 'pending' | 'complete' | 'error';
}

export type PageView =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'tasks'
  | 'notes'
  | 'expenses'
  | 'documents'
  | 'ai-assistant'
  | 'profile'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
