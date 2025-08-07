'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { BookmarkletInstaller } from '@/components/BookmarkletInstaller';
import { ResetConfirmationModal } from '@/components/ResetConfirmationModal';
// import { HighlightStats } from '@/components/HighlightStats'; // Temporarily disabled
import { 
  Bookmark, 
  AlertCircle,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { ApiResponse, UserApiKey, BookmarkletResponse, HighlightListResponse } from '@/types';

interface BookmarkletDashboardProps {
  className?: string;
}

export function BookmarkletDashboard({ className = '' }: BookmarkletDashboardProps) {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<UserApiKey | null>(null);
  const [bookmarklet, setBookmarklet] = useState<BookmarkletResponse | null>(null);
  const [, setHighlights] = useState<HighlightListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load API key, bookmarklet, and recent highlights in parallel
      const [apiKeyResponse, bookmarkletResponse, highlightsResponse] = await Promise.allSettled([
        fetch('/api/user/api-key', { credentials: 'include' }),
        fetch('/api/user/bookmarklet', { credentials: 'include' }),
        fetch('/api/highlights/list?limit=10', { credentials: 'include' })
      ]);

      // Handle API key response
      if (apiKeyResponse.status === 'fulfilled' && apiKeyResponse.value.ok) {
        const apiResult: ApiResponse<UserApiKey> = await apiKeyResponse.value.json();
        if (apiResult.success && apiResult.data) {
          setApiKey(apiResult.data);
        }
      }

      // Handle bookmarklet response  
      if (bookmarkletResponse.status === 'fulfilled' && bookmarkletResponse.value.ok) {
        const bookmarkletResult: ApiResponse<BookmarkletResponse> = await bookmarkletResponse.value.json();
        if (bookmarkletResult.success && bookmarkletResult.data) {
          setBookmarklet(bookmarkletResult.data);
        }
      }

      // Handle highlights response
      if (highlightsResponse.status === 'fulfilled' && highlightsResponse.value.ok) {
        const highlightsResult: ApiResponse<HighlightListResponse> = await highlightsResponse.value.json();
        if (highlightsResult.success && highlightsResult.data) {
          setHighlights(highlightsResult.data);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyUpdate = (newApiKey: UserApiKey) => {
    setApiKey(newApiKey);
    // Reload bookmarklet with new API key
    loadDashboardData();
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      
      const response = await fetch('/api/user/api-key', {
        method: 'DELETE',
        credentials: 'include',
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Clear all state
        setApiKey(null);
        setBookmarklet(null);
        setHighlights(null);
        setShowResetModal(false);
        
        // Show success message (you could add a toast system here)
        console.log('Bookmarklet setup reset successfully');
      } else {
        setError(result.error || 'Failed to reset bookmarklet setup');
      }
    } catch (err) {
      console.error('Error resetting bookmarklet setup:', err);
      setError('Network error occurred while resetting');
    } finally {
      setIsResetting(false);
    }
  };


  // Anonymous user state
  if (!user) {
    return (
      <div className={`bg-base-200 rounded-lg border border-base-300 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            Upgrade Your Account
          </h3>
          <p className="text-base-content/70 mb-6">
            Create a permanent account to access the bookmarklet and save highlights across all your devices.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Bookmarklet Preview
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
              The bookmarklet allows you to capture highlights from any website with a single click:
            </p>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center gap-2 cursor-not-allowed opacity-75">
              <Bookmark className="h-4 w-4" />
              <span className="text-sm font-medium">Neemee Highlight</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
              Available after account creation
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Account
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className={`bg-base-200 rounded-lg border border-base-300 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            Sign In Required
          </h3>
          <p className="text-base-content/70 mb-4">
            Please sign in to access your bookmarklet dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-base-200 rounded-lg border border-base-300 p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-base-content/70">Loading bookmarklet dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-base-200 rounded-lg border border-base-300 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-base-content/70 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Intro Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-base-content mb-2">
          Get your bookmarklet working in 2 simple steps
        </h2>
        <p className="text-base-content/70">
          Generate your API key, then install the bookmarklet
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {/* Step 1: API Key */}
        <div className={`bg-base-200 rounded-lg border border-base-300 ${!apiKey ? 'ring-2 ring-primary/20' : ''}`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-base-content">
                  Generate API Key
                </h3>
              </div>
              {apiKey && (
                <CheckCircle2 className="h-6 w-6 text-success" />
              )}
            </div>
            <p className="text-base-content/70 mb-4">
              Create a secure key to connect the bookmarklet to your account
            </p>
            <ApiKeyManager 
              apiKey={apiKey} 
              onUpdate={handleApiKeyUpdate}
            />
          </div>
        </div>

        {/* Step 2: Bookmarklet */}
        <div className={`bg-base-200 rounded-lg border border-base-300 transition-all duration-200 ${
          !apiKey ? 'opacity-50' : apiKey ? 'ring-2 ring-success/20' : ''
        }`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  apiKey ? 'bg-success text-success-content' : 'bg-base-300 text-base-content/50'
                }`}>
                  2
                </div>
                <h3 className="text-xl font-semibold text-base-content">
                  Install Bookmarklet
                </h3>
              </div>
              {apiKey && bookmarklet && (
                <CheckCircle2 className="h-6 w-6 text-success" />
              )}
            </div>
            <p className="text-base-content/70 mb-4">
              {!apiKey ? 'Complete Step 1 first' : 'Copy and paste the bookmarklet code into a new bookmark'}
            </p>
            <BookmarkletInstaller 
              bookmarklet={bookmarklet}
              isReady={!!apiKey}
            />
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {apiKey && bookmarklet && (
        <div className="text-center p-6 bg-success/10 rounded-lg border border-success/20">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-base-content mb-2">
            You&apos;re all set!
          </h3>
          <p className="text-base-content/70">
            Your bookmarklet is ready to use. Visit any website and click it to capture highlights.
          </p>
        </div>
      )}

      {/* Reset Section - Only show if API key exists */}
      {apiKey && (
        <div className="border-t border-base-300 pt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-base-content mb-2">
              Need to start over?
            </h3>
            <p className="text-base-content/70 mb-4 text-sm">
              Reset your bookmarklet setup if you&apos;re experiencing issues or want to generate a new API key.
            </p>
            <button
              onClick={() => setShowResetModal(true)}
              className="btn btn-outline btn-error btn-sm"
              disabled={isResetting}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Setup
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        isLoading={isResetting}
      />
    </div>
  );
}