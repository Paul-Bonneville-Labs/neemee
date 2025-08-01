'use client';

import { Github, Chrome, Loader2, AlertCircle, Shield } from 'lucide-react';
import { useAuth, type AuthProvider } from '../AuthProvider';

interface SocialAuthProps {
  onSuccess?: () => void;
}

export function SocialAuth({ onSuccess }: SocialAuthProps) {
  const { signInWithProvider, linkAccount, authState, clearError, isAnonymous, user } = useAuth();

  const handleProviderSignIn = async (provider: AuthProvider) => {
    clearError();
    
    try {
      if (isAnonymous && user) {
        // Link account for anonymous users
        const { error } = await linkAccount(provider);
        if (!error) {
          onSuccess?.();
        }
      } else {
        // Regular sign in
        const { error } = await signInWithProvider(provider);
        if (!error) {
          // OAuth redirect will handle the rest
          // onSuccess will be called after redirect
        }
      }
    } catch (error) {
      // Error handling is done by the auth context
    }
  };

  const providers = [
    {
      id: 'google' as AuthProvider,
      name: 'Google',
      icon: Chrome,
      description: 'Continue with your Google account',
      color: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
    },
    {
      id: 'github' as AuthProvider,
      name: 'GitHub',
      icon: Github,
      description: 'Continue with your GitHub account',
      color: 'bg-gray-900 dark:bg-gray-800 border-gray-900 dark:border-gray-600 text-white dark:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700'
    }
  ];

  const isLoading = authState.isSigningIn;
  const errorMessage = authState.error?.message;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isAnonymous ? 'Link Your Account' : 'Social Sign In'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isAnonymous 
            ? 'Connect a social account to save your progress and access your data from any device.'
            : 'Choose your preferred social account to continue. Fast, secure, and no password required.'
          }
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* Provider Buttons */}
      <div className="space-y-3">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const isProviderLoading = isLoading && authState.method === 'oauth';
          
          return (
            <button
              key={provider.id}
              onClick={() => handleProviderSignIn(provider.id)}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 
                         border rounded-lg text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 ${provider.color}`}
            >
              {isProviderLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>
                {isAnonymous ? `Link ${provider.name} Account` : `Continue with ${provider.name}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          {isAnonymous ? 'Benefits of linking your account:' : 'Why use social sign in?'}
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          {isAnonymous ? (
            <>
              <li>• Keep your highlights and data safe</li>
              <li>• Access your account from any device</li>
              <li>• Sync across all your devices</li>
              <li>• Never lose your progress</li>
            </>
          ) : (
            <>
              <li>• No passwords to create or remember</li>
              <li>• Secure authentication through trusted providers</li>
              <li>• Quick and easy one-click sign in</li>
              <li>• Your data stays private and secure</li>
            </>
          )}
        </ul>
      </div>

      {/* Anonymous User Notice */}
      {isAnonymous && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-amber-100 dark:bg-amber-900/40 rounded-full flex-shrink-0">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Currently using anonymous session
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Link a social account to convert your anonymous session to a permanent account. 
                Your current data will be preserved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We only access basic profile information (name, email, avatar). 
          We never post on your behalf or access private data.
        </p>
      </div>
    </div>
  );
}