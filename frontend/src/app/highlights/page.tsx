'use client';

import { useState } from 'react';
import { HighlightManager } from '@/components/HighlightManager';

export default function HighlightsPage() {
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);

  // Mock user info - replace with actual user data from your auth system
  const userInfo = {
    name: 'Demo User',
    role: 'contributor'
  };

  const handleHighlightSelect = (highlightId: string) => {
    setSelectedHighlight(highlightId);
    console.log('Selected highlight:', highlightId);
    // Here you would typically:
    // 1. Fetch the full highlight details
    // 2. Show them in a detail view or modal
    // 3. Navigate to a highlight detail page
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar with highlights */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <HighlightManager
          sidebarWidth={320}
          userInfo={userInfo}
          onHighlightSelect={handleHighlightSelect}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        {selectedHighlight ? (
          <div className="max-w-2xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Highlight Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Selected highlight ID: {selectedHighlight}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This is where you would display the full highlight content, 
              related entities, and provide editing capabilities.
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Select a Highlight
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a highlight from the sidebar to view its details and manage your captured content.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              No highlights yet? Use the bookmarklet to start capturing text from any website.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}