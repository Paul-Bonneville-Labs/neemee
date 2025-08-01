'use client';

import { UserPlus, Zap, Clock, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface AnonymousAuthProps {
  onSuccess?: () => void;
}

export function AnonymousAuth({ onSuccess }: AnonymousAuthProps) {
  const { signInAnonymously, authState, clearError, user, isAnonymous } = useAuth();

  const handleAnonymousSignIn = async () => {
    clearError();
    
    const { error } = await signInAnonymously();
    if (!error) {
      onSuccess?.();
    }
  };

  const isLoading = authState.isSigningIn && authState.method === 'anonymous';
  const errorMessage = authState.error?.message;

  // If already anonymous, show upgrade options
  if (isAnonymous && user) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Anonymous Session Active
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You're currently browsing anonymously. Your data is temporary and stored locally.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Upgrade to a permanent account
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Create a permanent account to save your progress and access your data from any device. 
              Choose from the other sign-in options to get started.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
            Current Anonymous Session:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name || 'Anonymous User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Session ID: {user.id.slice(0, 8)}...
                </p>
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Temporary
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Switch to Email & Password, Magic Link, or Social Login above to create a permanent account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quick Start
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Jump right in and start exploring. Perfect for trying out Neemee or quick sessions.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* Main Action */}
      <button
        onClick={handleAnonymousSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 
                 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                 text-white font-medium rounded-lg text-base
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
        <span>{isLoading ? 'Starting Anonymous Session...' : 'Start Anonymous Session'}</span>
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </button>

      {/* Features */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
          What you get with anonymous access:
        </h4>
        
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded-full flex-shrink-0">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Instant Access
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                No sign-up required - start using Neemee immediately
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full flex-shrink-0">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Full Privacy
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                No personal information collected or stored
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="p-1 bg-purple-100 dark:bg-purple-900/40 rounded-full flex-shrink-0">
              <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Easy Upgrade
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Convert to permanent account anytime to save your data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Temporary Session
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Your anonymous session data is stored locally and will be lost when you clear your browser data 
              or use a different device. Create a permanent account to keep your highlights safe.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Perfect for testing Neemee or when you need quick access without creating an account.
        </p>
      </div>
    </div>
  );
}