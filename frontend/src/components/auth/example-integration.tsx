/**
 * Example integration of the authentication components
 * This file shows how to integrate the auth components into your app
 */

'use client';

import { useState } from 'react';
import { 
  Auth, 
  AuthModal, 
  ProfileMenu, 
  AuthStatus,
  AuthStatusBadge,
  useAuth 
} from './index';

// Example: Header component with authentication
export function ExampleHeader() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Neemee
        </h1>
        <AuthStatusBadge />
      </div>
      
      <div className="flex items-center gap-4">
        <AuthStatus compact={true} />
        
        {loading ? (
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        ) : user ? (
          <ProfileMenu />
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Sign In
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="anonymous"
      />
    </header>
  );
}

// Example: Dashboard page with auth protection
export function ExampleDashboard() {
  const { user, loading, isAnonymous } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to Neemee
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your personal knowledge management system
          </p>
          
          {/* Embedded Auth component */}
          <Auth
            onClose={() => console.log('Auth completed')}
            title="Get Started"
            subtitle="Choose how you'd like to begin"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ExampleHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Anonymous user upgrade prompt */}
        {isAnonymous && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Anonymous Session Active
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Create a permanent account to save your progress
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-md transition-colors duration-200"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* Main dashboard content */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Welcome, {user.name || 'User'}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This is your dashboard. Your authentication status is shown in the header.
            </p>
            
            <div className="mt-4 flex items-center gap-4">
              <AuthStatus showDetails={true} />
            </div>
          </div>

          {/* Example content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Your Highlights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your captured highlights
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Knowledge Graph  
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore your knowledge connections
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Export Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download your data in various formats
              </p>
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="email"
        title="Upgrade Your Account"
        subtitle="Create a permanent account to save your data"
      />
    </div>
  );
}

// Example: Simple auth form for specific use cases
export function ExampleQuickAuth() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <Auth
        defaultTab="anonymous"
        title="Quick Demo"
        subtitle="Try Neemee instantly"
        onClose={() => window.location.href = '/dashboard'}
      />
    </div>
  );
}