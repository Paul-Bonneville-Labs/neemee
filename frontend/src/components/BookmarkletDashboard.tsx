'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { BookmarkletInstaller } from '@/components/BookmarkletInstaller';
import { BookmarkletInstructions } from '@/components/BookmarkletInstructions';
import { HighlightStats } from '@/components/HighlightStats';
import { 
  Bookmark, 
  Key, 
  BookOpen, 
  BarChart3, 
  AlertCircle,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { ApiResponse, UserApiKey, BookmarkletResponse, HighlightListResponse } from '@/types';

interface BookmarkletDashboardProps {
  className?: string;
}

export function BookmarkletDashboard({ className = '' }: BookmarkletDashboardProps) {
  const { user, isAnonymous } = useAuth();
  const [apiKey, setApiKey] = useState<UserApiKey | null>(null);
  const [bookmarklet, setBookmarklet] = useState<BookmarkletResponse | null>(null);
  const [highlights, setHighlights] = useState<HighlightListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'setup' | 'stats'>('setup');

  // Load data on mount
  useEffect(() => {
    if (user && !isAnonymous) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user, isAnonymous]);

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

  const handleHighlightUpdate = () => {
    // Reload highlights data
    loadDashboardData();
  };

  // Anonymous user state
  if (isAnonymous) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upgrade Your Account
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
      <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
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
      <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading bookmarklet dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Bookmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bookmarklet Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Capture highlights from any website with one click
              </p>
            </div>
          </div>
          
          {/* Section Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveSection('setup')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === 'setup'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Setup
            </button>
            <button
              onClick={() => setActiveSection('stats')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === 'stats'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Key className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                API Key
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {apiKey ? 'Active' : 'Not Generated'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Bookmark className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Bookmarklet
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {bookmarklet ? 'Ready' : 'Pending Setup'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Highlights
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {highlights?.pagination.total || 0} total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeSection === 'setup' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Setup */}
          <div className="space-y-6">
            {/* API Key Management */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    API Key Management
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your API key is required for the bookmarklet to work
                </p>
              </div>
              <div className="p-4">
                <ApiKeyManager 
                  apiKey={apiKey} 
                  onUpdate={handleApiKeyUpdate}
                />
              </div>
            </div>

            {/* Bookmarklet Installation */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Bookmarklet Installation
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Drag the button below to your bookmarks bar
                </p>
              </div>
              <div className="p-4">
                <BookmarkletInstaller 
                  bookmarklet={bookmarklet}
                  isReady={!!apiKey}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Instructions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Setup Instructions
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Step-by-step guide to get started
                </p>
              </div>
              <div className="p-4">
                <BookmarkletInstructions 
                  hasApiKey={!!apiKey}
                  hasBookmarklet={!!bookmarklet}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Statistics Section */
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Highlight Statistics
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your highlighting activity and insights
            </p>
          </div>
          <div className="p-4">
            <HighlightStats 
              highlights={highlights}
              onRefresh={handleHighlightUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}