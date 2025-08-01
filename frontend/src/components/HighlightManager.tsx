'use client';

import { useState } from 'react';
import { HighlightList } from './HighlightList';
import { BookmarkletModal } from './BookmarkletModal';
import { useHighlights } from '@/hooks/useHighlights';

interface HighlightManagerProps {
  sidebarWidth?: number;
  userInfo?: { name?: string; role?: string };
  onHighlightSelect?: (highlightId: string) => void;
}

export function HighlightManager({ 
  sidebarWidth, 
  userInfo, 
  onHighlightSelect 
}: HighlightManagerProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<string | undefined>();
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);
  
  const {
    highlights,
    isLoading,
    error,
    refresh,
    deleteHighlight
  } = useHighlights({
    page: 1,
    limit: 100,
    autoRefresh: false // Can be enabled for real-time updates
  });

  const handleHighlightSelect = (highlightId: string) => {
    setSelectedHighlight(highlightId);
    onHighlightSelect?.(highlightId);
  };

  const handleDeleteHighlight = async (highlightId: string) => {
    const success = await deleteHighlight(highlightId);
    if (success && selectedHighlight === highlightId) {
      setSelectedHighlight(undefined);
    }
  };

  const handleViewBookmarklet = () => {
    setShowBookmarkletModal(true);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  // Display error state if there's an error
  if (error && !isLoading && highlights.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.86-.833-2.598 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Failed to Load Highlights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={handleViewBookmarklet}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                         rounded-md hover:bg-gray-300 dark:hover:bg-gray-600
                         focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                         transition-colors duration-200"
              >
                View Bookmarklet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <HighlightList
        highlights={highlights}
        selectedHighlight={selectedHighlight}
        onHighlightSelect={handleHighlightSelect}
        onDeleteHighlight={handleDeleteHighlight}
        onViewBookmarklet={handleViewBookmarklet}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        sidebarWidth={sidebarWidth}
        userInfo={userInfo}
      />

      <BookmarkletModal
        isOpen={showBookmarkletModal}
        onClose={() => setShowBookmarkletModal(false)}
      />
    </>
  );
}