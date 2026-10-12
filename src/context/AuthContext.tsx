import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { getSupabaseClient, isSupabaseConfigured, getStoredSupabaseConfig } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCloudConnected: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  updatePassword: (oldPass: string, newPass: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  recheckConnection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Helper to load profile from Supabase profiles table
  const loadSupabaseProfile = useCallback(async (userId: string, authUser?: any): Promise<UserProfile> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client unavailable');
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile && !error) {
        return profile as UserProfile;
      }

      // Profile record doesn't exist yet, create it from auth metadata
      const newProfile: UserProfile = {
        id: userId,
        full_name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'LifeDesk Member',
        email: authUser?.email || '',
        avatar_url: authUser?.user_metadata?.avatar_url || '',
        created_at: authUser?.created_at || new Date().toISOString(),
      };

      await supabase.from('profiles').upsert(newProfile);
      return newProfile;
    } catch (err) {
      console.warn('Error fetching Supabase profile, constructing from session:', err);
      return {
        id: userId,
        full_name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'LifeDesk Member',
        email: authUser?.email || '',
        avatar_url: authUser?.user_metadata?.avatar_url || '',
        created_at: authUser?.created_at || new Date().toISOString(),
      };
    }
  }, []);

  const checkCurrentSession = useCallback(async () => {
    setIsLoading(true);
    const cloudReady = isSupabaseConfigured();
    setIsCloudConnected(cloudReady);
    const supabase = getSupabaseClient();

    if (cloudReady && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        }

        if (session?.user) {
          const profile = await loadSupabaseProfile(session.user.id, session.user);
          setUser(profile);
          setIsLoading(false);
          return;
        } else {
          // Explicitly no active Supabase session
          setUser(null);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to verify Supabase session:', err);
      }
    }

    // Local authentication engine fallback
    const storedSession = localStorage.getItem('lifedesk_session_user');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed && parsed.id && parsed.email) {
          setUser(parsed);
          setIsLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem('lifedesk_session_user');
      }
    }

    // No active user session - unauthenticated
    setUser(null);
    setIsLoading(false);
  }, [loadSupabaseProfile]);

  // Listen to Supabase auth events (sign-in, token refresh, sign-out)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const profile = await loadSupabaseProfile(session.user.id, session.user);
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('lifedesk_session_user');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [loadSupabaseProfile]);

  useEffect(() => {
    checkCurrentSession();
  }, [checkCurrentSession]);

  const recheckConnection = () => {
    checkCurrentSession();
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile = await loadSupabaseProfile(data.user.id, data.user);
          setUser(profile);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Supabase authentication failed' };
      }
    }

    // Local authentication engine
    const usersJson = localStorage.getItem('lifedesk_registered_users');
    const registeredUsers: any[] = usersJson ? JSON.parse(usersJson) : [];

    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      setIsLoading(false);
      return {
        success: false,
        error: 'No account found with this email. Please register to create your workspace.',
      };
    }

    if (found.password !== cleanPassword) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials and try again.',
      };
    }

    const activeUser: UserProfile = {
      id: found.id,
      full_name: found.full_name,
      email: found.email,
      avatar_url: found.avatar_url || '',
      created_at: found.created_at,
    };

    setUser(activeUser);
    localStorage.setItem('lifedesk_session_user', JSON.stringify(activeUser));
    setIsLoading(false);
    return { success: true };
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            full_name: cleanName,
            email: cleanEmail,
            avatar_url: '',
            created_at: data.user.created_at || new Date().toISOString(),
          };

          // Explicitly upsert profile into public.profiles table
          try {
            await supabase.from('profiles').upsert(newProfile);
          } catch (upsertErr) {
            console.warn('Profile table upsert warning:', upsertErr);
          }

          // If email confirmation is enabled on Supabase project and no session returned
          if (!data.session) {
            setIsLoading(false);
            return {
              success: true,
              error: 'Account created! If email confirmation is enabled in your Supabase project, check your inbox to confirm.',
            };
          }

          setUser(newProfile);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || 'Registration failed' };
      }
    }

    // Local authentication engine
    const usersJson = localStorage.getItem('lifedesk_registered_users');
    const registeredUsers: any[] = usersJson ? JSON.parse(usersJson) : [];

    const exists = registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      setIsLoading(false);
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      };
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      full_name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      created_at: new Date().toISOString(),
      avatar_url: '',
    };

    registeredUsers.push(newUser);
    localStorage.setItem('lifedesk_registered_users', JSON.stringify(registeredUsers));

    const activeUser: UserProfile = {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      created_at: newUser.created_at,
      avatar_url: '',
    };

    setUser(activeUser);
    localStorage.setItem('lifedesk_session_user', JSON.stringify(activeUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout error:', e);
      }
    }

    localStorage.removeItem('lifedesk_session_user');
    setUser(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) {
          return { success: false, message: error.message, error: error.message };
        }
        return {
          success: true,
          message: 'Password reset link dispatched to your email address.',
        };
      } catch (e: any) {
        return { success: false, message: e?.message || 'Password reset request failed', error: e?.message };
      }
    }

    return {
      success: true,
      message: 'Password reset request acknowledged. If an account matches this email, instructions are ready.',
    };
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 360;
            const width = img.width;
            const height = img.height;

            // Square center-crop
            const minDim = Math.min(width, height);
            const startX = (width - minDim) / 2;
            const startY = (height - minDim) / 2;

            canvas.width = maxDim;
            canvas.height = maxDim;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxDim, maxDim);
              const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
              await updateProfile({ avatar_url: optimizedBase64 });
              resolve(optimizedBase64);
            } else {
              const rawBase64 = reader.result as string;
              await updateProfile({ avatar_url: rawBase64 });
              resolve(rawBase64);
            }
          } catch (canvasErr) {
            const rawBase64 = reader.result as string;
            await updateProfile({ avatar_url: rawBase64 });
            resolve(rawBase64);
          }
        };
        img.onerror = () => reject(new Error('Failed to parse image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const updatePassword = async (_oldPass: string, newPass: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw new Error(error.message);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    await logout();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const updatedUser: UserProfile = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('lifedesk_session_user', JSON.stringify(updatedUser));

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('profiles').update(updates).eq('id', user.id);
        } catch (e) {
          console.warn('Supabase profile update error:', e);
        }
      }
    } else {
      const usersJson = localStorage.getItem('lifedesk_registered_users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const idx = users.findIndex((u: any) => u.id === user.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updates };
          localStorage.setItem('lifedesk_registered_users', JSON.stringify(users));
        }
      }
    }
  };

  const reloadProfile = async () => {
    if (!user) return;
    if (isSupabaseConfigured()) {
      const profile = await loadSupabaseProfile(user.id);
      setUser(profile);
    } else {
      const session = localStorage.getItem('lifedesk_session_user');
      if (session) {
        setUser(JSON.parse(session));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isCloudConnected,
        login,
        register,
        logout,
        signOut: logout,
        resetPassword,
        updateProfile,
        uploadAvatar,
        updatePassword,
        deleteAccount,
        reloadProfile,
        recheckConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
