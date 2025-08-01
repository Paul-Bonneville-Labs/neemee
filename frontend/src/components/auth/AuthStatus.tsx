'use client';

import { User, UserPlus, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface AuthStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function AuthStatus({ 
  className = '', 
  showDetails = true, 
  compact = false 
}: AuthStatusProps) {
  const { user, loading, isAnonymous, authState } = useAuth();

  // Loading state
  if (loading || authState.isLoadingSession) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        {!compact && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </span>
        )}
      </div>
    );
  }

  // Error state
  if (authState.error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        {!compact && (
          <span className="text-sm text-red-600 dark:text-red-400">
            Auth Error
          </span>
        )}
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <User className="h-4 w-4 text-gray-400" />
        {!compact && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Not signed in
          </span>
        )}
      </div>
    );
  }

  // Anonymous user
  if (isAnonymous) {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="relative">
            <UserPlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          <UserPlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
        </div>
        {showDetails && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Anonymous Session
            </span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Temporary
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Authenticated user
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      {showDetails && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-green-900 dark:text-green-100">
            {user.name || 'Authenticated'}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-700 dark:text-green-300">
              {user.email || 'Signed in'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Specific status indicator variants
export function AuthStatusBadge({ className = '' }: { className?: string }) {
  const { user, loading, isAnonymous } = useAuth();

  if (loading) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                     bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        Loading
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                     bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${className}`}>
        <User className="h-3 w-3 mr-1" />
        Guest
      </div>
    );
  }

  if (isAnonymous) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                     bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 ${className}`}>
        <UserPlus className="h-3 w-3 mr-1" />
        Anonymous
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                   bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 ${className}`}>
      <CheckCircle className="h-3 w-3 mr-1" />
      Authenticated
    </div>
  );
}

// Connection status indicator (useful for network-dependent features)
export function ConnectionStatus({ className = '' }: { className?: string }) {
  const { authState, user } = useAuth();

  const getConnectionStatus = () => {
    if (authState.isSigningIn || authState.isSigningUp || authState.isSigningOut) {
      return {
        icon: Loader2,
        text: 'Connecting...',
        color: 'text-blue-600 dark:text-blue-400',
        animate: true
      };
    }

    if (authState.error) {
      return {
        icon: AlertCircle,
        text: 'Connection Error',
        color: 'text-red-600 dark:text-red-400',
        animate: false
      };
    }

    if (user) {
      return {
        icon: CheckCircle,
        text: 'Connected',
        color: 'text-green-600 dark:text-green-400',
        animate: false
      };
    }

    return {
      icon: User,
      text: 'Offline',
      color: 'text-gray-400',
      animate: false
    };
  };

  const status = getConnectionStatus();
  const Icon = status.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className={`h-4 w-4 ${status.color} ${status.animate ? 'animate-spin' : ''}`} />
      <span className={`text-sm ${status.color}`}>
        {status.text}
      </span>
    </div>
  );
}