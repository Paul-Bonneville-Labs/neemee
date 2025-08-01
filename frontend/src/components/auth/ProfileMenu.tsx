'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  UserPlus, 
  Shield, 
  Github, 
  Chrome,
  Mail,
  Loader2
} from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface ProfileMenuProps {
  className?: string;
}

export function ProfileMenu({ className = '' }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { 
    user, 
    isAnonymous, 
    signOut, 
    signInWithProvider, 
    linkAccount, 
    authState 
  } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowUpgradeOptions(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleLinkAccount = async (provider: 'github' | 'google') => {
    if (isAnonymous) {
      await linkAccount(provider);
    } else {
      await signInWithProvider(provider);
    }
    setIsOpen(false);
    setShowUpgradeOptions(false);
  };

  if (!user) return null;

  const isLoading = authState.isSigningOut || authState.isSigningIn;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                 bg-white dark:bg-gray-800 
                 border border-gray-200 dark:border-gray-700
                 text-gray-900 dark:text-gray-100
                 hover:bg-gray-50 dark:hover:bg-gray-700
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 transition-colors duration-200"
        disabled={isLoading}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
          {isAnonymous && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white dark:border-gray-800" />
          )}
        </div>

        {/* Name and Role */}
        <div className="text-left min-w-0 flex-1">
          <div className="font-medium truncate">
            {user.name || 'Anonymous'}
          </div>
          <div className={`text-xs truncate ${
            isAnonymous 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isAnonymous ? 'Temporary Session' : (user.role || 'User')}
          </div>
        </div>

        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 
                      border border-gray-200 dark:border-gray-700 
                      rounded-lg shadow-lg z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                )}
                {isAnonymous && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.name || 'Anonymous User'}
                </div>
                {user.email && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                )}
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  isAnonymous
                    ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                }`}>
                  {isAnonymous ? 'Temporary' : 'Permanent'}
                </div>
              </div>
            </div>
          </div>

          {/* Anonymous User Upgrade Options */}
          {isAnonymous && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left
                         text-amber-900 dark:text-amber-100 bg-amber-50 dark:bg-amber-900/20
                         hover:bg-amber-100 dark:hover:bg-amber-900/30
                         rounded-lg transition-colors duration-200"
              >
                <UserPlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="flex-1 text-sm font-medium">Upgrade Account</span>
                <ChevronDown className={`h-4 w-4 text-amber-600 dark:text-amber-400 transition-transform duration-200 ${
                  showUpgradeOptions ? 'rotate-180' : ''
                }`} />
              </button>

              {showUpgradeOptions && (
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => handleLinkAccount('google')}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left
                             text-gray-700 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-700
                             rounded-lg transition-colors duration-200 text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Chrome className="h-4 w-4" />
                    )}
                    Link Google Account
                  </button>
                  
                  <button
                    onClick={() => handleLinkAccount('github')}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left
                             text-gray-700 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-700
                             rounded-lg transition-colors duration-200 text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="h-4 w-4" />
                    )}
                    Link GitHub Account
                  </button>
                  
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                    Or use Email & Password or Magic Link from the main auth screen
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Menu Items */}
          <div className="p-2">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left
                       text-gray-700 dark:text-gray-300 
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       rounded-lg transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Settings</span>
            </button>

            {!isAnonymous && (
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-left
                         text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         rounded-lg transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm">Privacy & Security</span>
              </button>
            )}
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-3 py-2 text-left
                       text-red-700 dark:text-red-400 
                       hover:bg-red-50 dark:hover:bg-red-900/20
                       rounded-lg transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="text-sm">
                {isAnonymous ? 'End Session' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}