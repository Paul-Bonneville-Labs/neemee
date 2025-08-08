"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import type { Session } from 'next-auth'

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
  user: Session['user'] | null;
  session: Session | null;
  loading: boolean;
  authState: AuthState;
  
  // OAuth sign-in methods
  signIn: (provider?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  
  // Sign out
  signOut: () => Promise<void>;
  
  // Utility methods
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === 'loading'

  const signIn = async (provider: string = 'google') => {
    await nextAuthSignIn(provider, { callbackUrl: '/' })
  }

  const signInWithGoogle = async () => {
    await nextAuthSignIn('google', { callbackUrl: '/' })
  }

  const signInWithGitHub = async () => {
    await nextAuthSignIn('github', { callbackUrl: '/' })
  }

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' })
  }

  const clearError = () => {
    // Error clearing logic if needed
  }

  const value: AuthContextType = {
    user: session?.user || null,
    session,
    loading,
    authState: {
      isSigningIn: status === 'loading',
      isSigningOut: false,
      isLoadingSession: status === 'loading',
      error: null
    },
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};