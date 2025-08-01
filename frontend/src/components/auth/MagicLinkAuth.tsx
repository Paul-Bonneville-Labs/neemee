'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface MagicLinkAuthProps {
  onSuccess?: () => void;
}

export function MagicLinkAuth({ onSuccess }: MagicLinkAuthProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { signInWithMagicLink, authState, clearError } = useAuth();

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    clearError();
    
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    const { error } = await signInWithMagicLink(email);
    if (!error) {
      setSuccess(true);
      // Note: Don't call onSuccess here as user needs to check email first
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError(null);
    }
    if (authState.error) {
      clearError();
    }
  };

  const isLoading = authState.isSigningIn;
  const errorMessage = authState.error?.message || emailError;

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Check your email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We've sent a magic link to <span className="font-medium text-gray-900 dark:text-gray-100">{email}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click the link in the email to complete your sign in. The link will expire in 60 minutes.
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Didn't receive the email?
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email address</li>
                <li>• Wait a few minutes for the email to arrive</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setEmail('');
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
                   transition-colors duration-200"
        >
          Try a different email address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Magic Link Sign In
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a secure link to sign in instantly - no password required.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="magic-email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              disabled={isLoading}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-100 
                        placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${emailError || authState.error
                          ? 'border-red-300 dark:border-red-700' 
                          : 'border-gray-300 dark:border-gray-600'
                        }`}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
                   bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                   text-white font-medium rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isLoading ? 'Sending Magic Link...' : 'Send Magic Link'}
        </button>
      </form>

      {/* Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          How it works:
        </h4>
        <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>1. Enter your email address above</li>
          <li>2. Check your inbox for a secure sign-in link</li>
          <li>3. Click the link to instantly access your account</li>
          <li>4. No passwords to remember or type!</li>
        </ol>
      </div>
    </div>
  );
}