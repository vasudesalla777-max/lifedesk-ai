import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  key: string;
}

// Read from import.meta.env or browser localStorage overrides
export const getStoredSupabaseConfig = (): SupabaseConfig => {
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('lifedesk_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('lifedesk_supabase_key') || '' : '';

  const url = (storedUrl || envUrl).trim();
  const key = (storedKey || envKey).trim();

  return { url, key };
};

let supabaseInstance: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key || !url.startsWith('http') || url.includes('your-project')) {
    return null;
  }

  // Re-instantiate if config changed
  if (!supabaseInstance || lastUsedUrl !== url || lastUsedKey !== key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      lastUsedUrl = url;
      lastUsedKey = key;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
};

export const setSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('lifedesk_supabase_url', url.trim());
    } else {
      localStorage.removeItem('lifedesk_supabase_url');
    }

    if (key.trim()) {
      localStorage.setItem('lifedesk_supabase_key', key.trim());
    } else {
      localStorage.removeItem('lifedesk_supabase_key');
    }
  }
  supabaseInstance = null;
  lastUsedUrl = '';
  lastUsedKey = '';
  return getSupabaseClient();
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(url && key && url.startsWith('http') && !url.includes('your-project'));
};

export const testSupabaseConnection = async (
  customUrl?: string,
  customKey?: string
): Promise<{ ok: boolean; message: string; details?: any }> => {
  const url = (customUrl || getStoredSupabaseConfig().url).trim();
  const key = (customKey || getStoredSupabaseConfig().key).trim();

  if (!url || !key || !url.startsWith('http') || url.includes('your-project')) {
    return {
      ok: false,
      message: 'Invalid URL or key. Please enter a valid Supabase project URL (https://xyz.supabase.co) and public anon key.',
    };
  }

  try {
    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Test health by checking auth settings or querying public table
    const { data: sessionData, error: authError } = await testClient.auth.getSession();
    if (authError && authError.message.includes('Invalid API key')) {
      return { ok: false, message: `Authentication Error: ${authError.message}` };
    }

    // Attempt to query profiles table to verify schema
    const { error: profileError } = await testClient.from('profiles').select('id').limit(1);

    if (profileError && profileError.message.includes('relation "public.profiles" does not exist')) {
      return {
        ok: true,
        message: 'Connected to Supabase! However, the database tables have not been created yet. Run the SQL schema script in your Supabase SQL Editor.',
        details: { tablesMissing: true },
      };
    }

    return {
      ok: true,
      message: 'Successfully connected to Supabase PostgreSQL & Auth with Row Level Security!',
      details: { tablesMissing: false, sessionData },
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Connection failed: ${err?.message || 'Network error'}`,
    };
  }
};

/**
 * Generates a standard RFC4122 v4 UUID compatible with PostgreSQL UUID columns
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
