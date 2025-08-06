'use client';

import { X } from 'lucide-react';
import { MagicLinkAuth } from './auth/MagicLinkAuth';

interface AuthProps {
  onClose?: () => void;
  showClose?: boolean;
  title?: string;
  subtitle?: string;
}

export function Auth({ 
  onClose, 
  showClose = false
}: AuthProps) {

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      {showClose && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                   rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 
                   transition-colors duration-200 z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}

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