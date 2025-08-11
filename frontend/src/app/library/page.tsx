'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UserApiKey, ApiResponse } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToasts, ToastContainer } from '@/components/Toast';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { EmptyLibraryState } from '@/components/library/EmptyLibraryState';
import { NotesGridView } from '@/components/library/NotesGridView';
import { NotesListView } from '@/components/library/NotesListView';
import { InfiniteScrollContainer, NotesGridSkeleton, NotesListSkeleton } from '@/components/InfiniteScrollContainer';
import { usePaginatedNotes } from '@/hooks/usePaginatedNotes';
import { BookmarkletLoginPage } from '@/components/BookmarkletLoginPage';

function LibraryPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, dismissToast, showSuccess, showError } = useToasts();
  
  // Pagination state using our custom hook - only load when user is authenticated
  const {
    notes,
    total,
    hasMore,
    isInitialLoading,
    isPaginating,
    error: paginationError,
    loadMore,
    search,
    refresh,
    searchTerm,
    isSearching
  } = usePaginatedNotes({
    shouldLoad: !!user && !loading // Only load notes when user is authenticated
  });
  
  // View and API key state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [apiKey, setApiKey] = useState<UserApiKey | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if this is a bookmarklet request (requires all capture parameters)
  const isBookmarkletRequest = useMemo(() => 
    mounted && 
    searchParams.has('text') && 
    searchParams.has('url') && 
    searchParams.has('key'),
    [mounted, searchParams]
  );

  // Redirect unauthenticated users to home
  useEffect(() => {
    console.log('Library auth check:', { loading, user: !!user, mounted, isBookmarkletRequest });
    if (!loading && !user && mounted && !isBookmarkletRequest) {
      console.log('Redirecting to home from library');
      router.push('/');
    }
  }, [user, loading, mounted, isBookmarkletRequest, router]);

  // Load saved view mode preference
  useEffect(() => {
    if (mounted) {
      const savedViewMode = localStorage.getItem('library-view-mode') as 'grid' | 'list';
      if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
        setViewMode(savedViewMode);
      }
    }
  }, [mounted]);

  // Handle view mode changes with localStorage persistence
  const handleViewModeChange = (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode);
    localStorage.setItem('library-view-mode', newViewMode);
  };

  // Handle setup button clicks
  const handleSetupClick = () => {
    router.push('/setup');
  };

  const loadApiKey = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/user/api-key', {
        credentials: 'include',
      });
      const result: ApiResponse<UserApiKey> = await response.json();
      
      if (result.success && result.data) {
        setApiKey(result.data);
      } else {
        // User doesn't have an API key yet (could be 404 or other error)
        setApiKey(null);
      }
    } catch (err) {
      console.error('Error loading API key:', err);
      setApiKey(null);
    }
  }, [user]);

  // Load API key when user is authenticated
  useEffect(() => {
    if (user && mounted) {
      loadApiKey();
    }
  }, [user, mounted, loadApiKey]);

  // Refresh API key when page becomes visible (in case user reset on another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && mounted) {
        loadApiKey();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, mounted, loadApiKey]);

  // Handle search changes (delegate to pagination hook)
  const handleSearchChange = (term: string) => {
    search(term);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show bookmarklet login page for unauthenticated bookmarklet requests
  if (!user && isBookmarkletRequest) {
    return <BookmarkletLoginPage />;
  }

  // If user is not authenticated, redirect will happen via useEffect
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  // Main library view for authenticated users
  return (
    <div className="min-h-screen bg-base-100">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Navigation Header */}
      <LibraryHeader
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        apiKey={apiKey}
        onSetupClick={handleSetupClick}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Initial Loading State */}
        {isInitialLoading ? (
          <>
            {viewMode === 'grid' ? (
              <NotesGridSkeleton />
            ) : (
              <NotesListSkeleton />
            )}
          </>
        ) : notes.length === 0 && !isSearching ? (
          <EmptyLibraryState 
            searchTerm={searchTerm}
            apiKey={apiKey}
            onSetupClick={handleSetupClick}
          />
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6 flex justify-between items-center">
              <div className="badge badge-outline text-base-content border-base-content/20 bg-base-200 rounded-full">
                {searchTerm ? (
                  <>Showing {notes.length} result{notes.length !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;{hasMore ? ' (loading more...)' : ''}</>
                ) : (
                  <>Showing {notes.length} of {total} note{total !== 1 ? 's' : ''} in your library</>
                )}
              </div>
              
              {/* Refresh button */}
              <button
                onClick={refresh}
                className="btn btn-ghost btn-sm text-base-content/70 hover:text-base-content"
                disabled={isInitialLoading || isPaginating}
              >
                {isInitialLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {/* Error display */}
            {paginationError && (
              <div className="alert alert-error mb-6">
                <span>Error loading notes: {paginationError}</span>
                <button
                  onClick={refresh}
                  className="btn btn-sm btn-error btn-outline ml-auto"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Notes Content with Infinite Scroll */}
            <InfiniteScrollContainer
              hasMore={hasMore}
              isLoading={isPaginating || isSearching}
              onLoadMore={loadMore}
              error={paginationError}
              onRetry={refresh}
            >
              {viewMode === 'grid' ? (
                <NotesGridView 
                  notes={notes}
                  onToast={(type, message, description) => {
                    if (type === 'success') {
                      showSuccess(message);
                    } else {
                      showError(message, description);
                    }
                  }}
                />
              ) : (
                <NotesListView 
                  notes={notes}
                  onToast={(type, message, description) => {
                    if (type === 'success') {
                      showSuccess(message);
                    } else {
                      showError(message, description);
                    }
                  }}
                />
              )}
            </InfiniteScrollContainer>
          </>
        )}
      </main>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <LibraryPageContent />
    </Suspense>
  );
}