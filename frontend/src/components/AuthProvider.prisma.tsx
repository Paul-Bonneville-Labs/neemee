'use client';

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
  
  signInWithMagicLink: (email: string) => Promise<{ error?: AuthError }>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Prisma-based AuthProvider using API routes
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

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.user) {
            setUser(sessionData.user);
            setSession(sessionData);
          }
        }
      } catch (error) {
        console.log('No existing session found');
      } finally {
        setLoading(false);
        updateAuthState({ isLoadingSession: false });
      }
    };

    checkSession();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    updateAuthState({ isSigningIn: true, error: null });
    
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (!response.ok) {
        const error = { message: result.error || 'Failed to send magic link' };
        updateAuthState({ isSigningIn: false, error });
        return { error };
      }

      updateAuthState({ isSigningIn: false });
      return {};
    } catch (error) {
      const authError = { message: 'Network error occurred' };
      updateAuthState({ isSigningIn: false, error: authError });
      return { error: authError };
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    updateAuthState({ error: null });
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const result = await response.json();
      
      if (!response.ok) {
        const error = { message: result.error || 'Failed to update profile' };
        updateAuthState({ error });
        return { error };
      }

      // Update local state
      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        if (session) {
          setSession({ ...session, user: updatedUser });
        }
      }

      return {};
    } catch (error) {
      const authError = { message: 'Network error occurred' };
      updateAuthState({ error: authError });
      return { error: authError };
    }
  };

  const signOut = async () => {
    updateAuthState({ isSigningOut: true, error: null });
    
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (!response.ok) {
        const result = await response.json();
        const error = { message: result.error || 'Failed to sign out' };
        updateAuthState({ isSigningOut: false, error });
        return { error };
      }

      setUser(null);
      setSession(null);
      updateAuthState({ isSigningOut: false });
      return {};
    } catch (error) {
      const authError = { message: 'Network error occurred' };
      updateAuthState({ isSigningOut: false, error: authError });
      return { error: authError };
    }
  };

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