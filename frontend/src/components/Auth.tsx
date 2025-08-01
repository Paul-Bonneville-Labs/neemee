'use client';

import { Mail, X } from 'lucide-react';
import { MagicLinkAuth } from './auth/MagicLinkAuth';

interface AuthProps {
  onClose?: () => void;
  showClose?: boolean;
  title?: string;
  subtitle?: string;
}

export function Auth({ 
  onClose, 
  showClose = false,
  title = 'Welcome to Neemee',
  subtitle = 'Sign in to save your highlights and access them from anywhere'
}: AuthProps) {

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          </div>
          {showClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                       rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 
                       transition-colors duration-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Magic Link Auth Content */}
      <div className="p-6">
        <MagicLinkAuth onSuccess={onClose} />
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}