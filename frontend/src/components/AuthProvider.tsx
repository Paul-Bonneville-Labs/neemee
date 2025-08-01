'use client';

import { createClient } from '@/lib/supabase/client';
import { type User, type AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, AuthSession } from '@/lib/auth';

export type AuthMethod = 'magic_link';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthState {
  isSigningIn: boolean;
  isSigningOut: boolean;
  isLoadingSession: boolean;
  error?: AuthError | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  authState: AuthState;
  
  // Magic Link method
  signInWithMagicLink: (email: string) => Promise<{ error?: AuthError }>;
  
  // Profile management
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error?: AuthError }>;
  
  // Sign out
  signOut: () => Promise<{ error?: AuthError }>;
  
  // Utility methods
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isSigningIn: false,
    isSigningOut: false,
    isLoadingSession: true,
    error: null
  });
  
  const supabase = createClient();

  const mapSupabaseUserToAuthUser = (supabaseUser: User): AuthUser => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
      email: supabaseUser.email || null,
      image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
      username: supabaseUser.user_metadata?.user_name || supabaseUser.user_metadata?.preferred_username || null,
      role: 'reader',
      permissions: {
        read: true,
        write: true,
        admin: false,
        delete: false
      }
    };
  };

  const handleAuthError = (error: SupabaseAuthError | any): AuthError => ({
    message: error?.message || 'An authentication error occurred',
    code: error?.code || error?.status?.toString()
  });

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const authUser = mapSupabaseUserToAuthUser(session.user);
        const authSession: AuthSession = {
          user: authUser,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        
        setUser(authUser);
        setSession(authSession);
      } else {
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
      updateAuthState({ isLoadingSession: false });
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const authUser = mapSupabaseUserToAuthUser(session.user);
          const authSession: AuthSession = {
            user: authUser,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
          
          setUser(authUser);
          setSession(authSession);
        } else {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
        updateAuthState({ 
          isLoadingSession: false,
          isSigningIn: false,
          isSigningOut: false
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Magic Link method
  const signInWithMagicLink = async (email: string) => {
    updateAuthState({ isSigningIn: true, error: null });
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      
      if (error) {
        const authError = handleAuthError(error);
        updateAuthState({ isSigningIn: false, error: authError });
        return { error: authError };
      }
      
      updateAuthState({ isSigningIn: false });
      return {};
    } catch (error) {
      const authError = handleAuthError(error);
      updateAuthState({ isSigningIn: false, error: authError });
      return { error: authError };
    }
  };


  // Profile management
  const updateProfile = async (updates: Partial<AuthUser>) => {
    updateAuthState({ error: null });
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          avatar_url: updates.image,
          user_name: updates.username,
        },
      });
      
      if (error) {
        const authError = handleAuthError(error);
        updateAuthState({ error: authError });
        return { error: authError };
      }
      
      return {};
    } catch (error) {
      const authError = handleAuthError(error);
      updateAuthState({ error: authError });
      return { error: authError };
    }
  };

  // Sign out
  const signOut = async () => {
    updateAuthState({ isSigningOut: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        const authError = handleAuthError(error);
        updateAuthState({ isSigningOut: false, error: authError });
        return { error: authError };
      }
      
      updateAuthState({ isSigningOut: false });
      return {};
    } catch (error) {
      const authError = handleAuthError(error);
      updateAuthState({ isSigningOut: false, error: authError });
      return { error: authError };
    }
  };

  // Utility methods
  const clearError = () => {
    updateAuthState({ error: null });
  };

  const value = {
    user,
    session,
    loading,
    authState,
    signInWithMagicLink,
    updateProfile,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};