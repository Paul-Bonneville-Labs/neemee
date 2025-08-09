'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  User, 
  LogOut, 
  UserPlus, 
  Github, 
  Chrome,
  Loader2,
  ChevronDown
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
    signOut, 
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

  const handleLinkAccount = async () => {
    // Note: Current auth system doesn't support provider linking
    // This would need to be implemented in the auth system
    setIsOpen(false);
    setShowUpgradeOptions(false);
  };

  if (!user) return null;

  const isLoading = authState.isSigningOut || authState.isSigningIn;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Profile Button - Just Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden
                 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 transition-all duration-200"
        disabled={isLoading}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 
                      border border-gray-200 dark:border-gray-700 
                      rounded-lg shadow-lg z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden relative">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                )}
                {false && (
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
                  false
                    ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                }`}>
                  {'Permanent'}
                </div>
              </div>
            </div>
          </div>

          {/* Anonymous User Upgrade Options */}
          {false && (
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
                    onClick={() => handleLinkAccount()}
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
                    onClick={() => handleLinkAccount()}
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
                    Or use OAuth authentication from the main auth screen
                  </div>
                </div>
              )}
            </div>
          )}


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
                {'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}