'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'medium', text, className = '' }: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'medium':
        return 'w-6 h-6';
      case 'large':
        return 'w-8 h-8';
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${getSizeClasses()} animate-spin text-blue-600`} />
      {text && (
        <span className="text-sm text-gray-600 font-medium">
          {text}
        </span>
      )}
    </div>
  );
}

// Overlay spinner for full-screen loading
export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
}