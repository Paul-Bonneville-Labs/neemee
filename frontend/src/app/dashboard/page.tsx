'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import dynamic from 'next/dynamic';
import { HighlightList } from '@/components/HighlightList';
import { HighlightEditor } from '@/components/HighlightEditor';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { ToastContainer, useToasts } from '@/components/Toast';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { Highlight, HighlightListResponse, ApiResponse, HighlightUpdateRequest } from '@/types';
import { LogOut, RefreshCw, Bookmark, FileText, Edit3, Database, BookOpen } from 'lucide-react';
import { BookmarkletDashboard } from '@/components/BookmarkletDashboard';
import { useContentExtraction } from '@/hooks';
import { formatDetailedDate } from '@/lib/dateUtils';
import appConfig from '../../../config.json';

function DashboardContent() {
  const { user, signOut: supabaseSignOut } = useAuth();
  const { toasts, dismissToast } = useToasts();
  const { extractContent, isExtracting, extractionError } = useContentExtraction();
  const [mounted, setMounted] = useState(false);
  
  // State management
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [currentHighlight, setCurrentHighlight] = useState<Highlight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // Guard to prevent multiple loads
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'bookmarklet'>('files');
  const [isEditing, setIsEditing] = useState(false);
  const [viewTab, setViewTab] = useState<'details' | 'content'>('details');
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<Highlight | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Load saved sidebar width from localStorage with enhanced validation
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth && /^\d+$/.test(savedWidth.trim())) {
      const width = parseInt(savedWidth, 10);
      if (!isNaN(width) && width >= 240 && width <= 600) { // Validate range and NaN
        setSidebarWidth(width);
      }
    }
  }, []);

  const loadHighlights = useCallback(async () => {
    if (hasLoaded) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/highlights/list', {
        credentials: 'include',
      });
      const result: ApiResponse<HighlightListResponse> = await response.json();
      
      if (result.success && result.data) {
        setHighlights(result.data.highlights);
        setHasLoaded(true);
      } else {
        console.error('Failed to load highlights:', result.error);
      }
    } catch (err) {
      console.error('Error loading highlights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasLoaded]);

  // Redirect if not authenticated - TEMPORARILY DISABLED FOR TESTING
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/');
  //   }
  // }, [status, router]);


  const handleHighlightSelect = useCallback((highlightId: string) => {
    // Clear current highlight first to show loading state
    setCurrentHighlight(null);
    setSelectedHighlight(highlightId);
    
    // Inline the loadHighlight logic to avoid dependency issues
    const loadHighlight = async () => {
      try {
        const response = await fetch(`/api/highlights/${encodeURIComponent(highlightId)}`, {
          credentials: 'include',
        });
        
        const result: ApiResponse<Highlight> = await response.json();
        
        if (result.success && result.data) {
          setCurrentHighlight(result.data);
        } else {
          console.error('API error:', result.error);
          setCurrentHighlight(null);
        }
      } catch (err) {
        console.error('Error loading highlight:', err);
        setCurrentHighlight(null);
      }
    };
    
    loadHighlight();
  }, []);

  // Load highlights on mount - but only once
  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]); // Include loadHighlights dependency

  // Handle direct navigation to specific highlight via URL parameter
  useEffect(() => {
    if (mounted && highlights.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const highlightParam = urlParams.get('highlight');
      
      if (highlightParam && !selectedHighlight) {
        // Check if the highlight exists in our loaded highlights
        const targetHighlight = highlights.find(h => h.id === highlightParam);
        if (targetHighlight) {
          handleHighlightSelect(highlightParam);
          // Clear the URL parameter to avoid re-triggering
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    }
  }, [mounted, highlights, selectedHighlight, handleHighlightSelect]);

  const handleViewBookmarklet = () => {
    setActiveTab('bookmarklet');
  };

  const handleDeleteHighlight = (highlightId: string) => {
    const highlight = highlights.find(h => h.id === highlightId);
    if (highlight) {
      setHighlightToDelete(highlight);
      setDeleteModalOpen(true);
    }
  };

  const confirmDeleteHighlight = async () => {
    if (!highlightToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/highlights/${encodeURIComponent(highlightToDelete.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        // Refresh highlights list
        setHasLoaded(false);
        await loadHighlights();
        
        // Clear selection if deleted highlight was selected
        if (selectedHighlight === highlightToDelete.id) {
          setSelectedHighlight(null);
          setCurrentHighlight(null);
        }
        
        // Close modal and reset state
        setDeleteModalOpen(false);
        setHighlightToDelete(null);
      } else {
        console.error('Failed to delete highlight:', result.error);
      }
    } catch (err) {
      console.error('Error deleting highlight:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteHighlight = () => {
    setDeleteModalOpen(false);
    setHighlightToDelete(null);
    setIsDeleting(false);
  };

  const handleRefreshHighlights = async () => {
    setHasLoaded(false);
    await loadHighlights();
  };

  const handleCancelView = () => {
    setCurrentHighlight(null);
    setSelectedHighlight(null);
    setIsEditing(false);
  };

  const handleEditHighlight = () => {
    setIsEditing(true);
  };

  const handleSaveHighlight = async (updates: HighlightUpdateRequest) => {
    if (!currentHighlight) return;

    try {
      const response = await fetch(`/api/highlights/${encodeURIComponent(currentHighlight.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const result: ApiResponse<Highlight> = await response.json();

      if (result.success && result.data) {
        // Update the current highlight
        setCurrentHighlight(result.data);
        
        // Update the highlight in the list
        setHighlights(prev => 
          prev.map(h => h.id === result.data!.id ? result.data! : h)
        );
        
        // Exit edit mode
        setIsEditing(false);
      } else {
        throw new Error(result.error || 'Failed to update highlight');
      }
    } catch (error) {
      console.error('Error updating highlight:', error);
      throw error; // Re-throw so the editor can handle it
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleExtractContent = async () => {
    if (!currentHighlight) return;
    
    const success = await extractContent(currentHighlight.id);
    if (success) {
      // Refresh the current highlight to get the updated content
      setHasLoaded(false);
      handleHighlightSelect(currentHighlight.id);
    }
  };

  // Sidebar resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    // Throttle the resize for better performance
    const now = Date.now();
    const lastCall = (handleMouseMove as unknown as { lastCall?: number }).lastCall || 0;
    if (now - lastCall < 16) return; // ~60fps
    (handleMouseMove as unknown as { lastCall: number }).lastCall = now;
    
    // Calculate relative width instead of using absolute e.clientX
    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
    if (!sidebar) return;
    
    const sidebarRect = sidebar.getBoundingClientRect();
    const newWidth = e.clientX - sidebarRect.left;
    const minWidth = 240; // Minimum sidebar width
    const maxWidth = Math.min(600, window.innerWidth * 0.4); // Max 40% of window width or 600px
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      localStorage.setItem('sidebar-width', newWidth.toString());
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // TEMPORARY: Skip loading and session checks for testing
  // if (status === 'loading') {
  //   return (
  //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
  //         <p className="text-gray-600 dark:text-gray-400">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!session) {
  //   return null; // Will redirect via useEffect
  // }

  // Prevent hydration mismatch - show loading until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {appConfig.app.displayName}
              </h1>
              
              
              {/* Refresh Button - Only show on Files tab */}
              {activeTab === 'files' && (
                <button
                  onClick={handleRefreshHighlights}
                  disabled={isLoading}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                  title="Load/Refresh highlights"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  await supabaseSignOut();
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                         hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'files'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              Highlights
            </button>
            
            <button
              onClick={() => setActiveTab('bookmarklet')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'bookmarklet'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              Bookmarklet
            </button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-200px)]">
        {activeTab === 'files' ? (
          <>
            {/* Sidebar - Hidden on mobile when editing */}
            <div 
              data-sidebar
              className={`flex-shrink-0 relative ${currentHighlight ? 'hidden lg:block' : 'block'}`}
              style={{ width: sidebarWidth }}
            >
              <HighlightList
                highlights={highlights}
                selectedHighlight={selectedHighlight || undefined}
                onHighlightSelect={handleHighlightSelect}
                onDeleteHighlight={handleDeleteHighlight}
                onViewBookmarklet={handleViewBookmarklet}
                onRefresh={handleRefreshHighlights}
                isLoading={isLoading}
                sidebarWidth={sidebarWidth}
                userInfo={{
                  name: user?.name || user?.username || 'Test User',
                  role: user?.role || 'developer'
                }}
              />
              
              {/* Resize Handle */}
              <div
                className={`absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors duration-200 group ${isResizing ? 'bg-blue-500 bg-opacity-50' : ''}`}
                onMouseDown={handleMouseDown}
              >
                {/* Visual indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-gray-300 group-hover:bg-blue-500 transition-colors duration-200 rounded-full"></div>
              </div>
            </div>

            {/* Main Highlight View Area */}
            <div className="flex-1 flex flex-col relative min-h-0 h-[calc(100vh-200px)]">
              {selectedHighlight && !currentHighlight ? (
                /* Loading state when highlight is selected but not yet loaded */
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading highlight...</p>
                  </div>
                </div>
              ) : currentHighlight ? (
                isEditing ? (
                  <HighlightEditor
                    highlight={currentHighlight}
                    onSave={handleSaveHighlight}
                    onCancel={handleCancelEdit}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Header with tabs and actions */}
                    <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                          {/* Mobile Back Button */}
                          <div className="lg:hidden">
                            <button
                              onClick={handleCancelView}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Back to Highlights
                            </button>
                          </div>
                          
                          {/* Desktop title */}
                          <div className="hidden lg:block">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              View Highlight
                            </h2>
                          </div>
                          
                          {/* Edit button */}
                          <button
                            onClick={handleEditHighlight}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setViewTab('details')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              viewTab === 'details'
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <FileText className="h-4 w-4" />
                            Details
                          </button>
                          <button
                            onClick={() => setViewTab('content')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              viewTab === 'content'
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <BookOpen className="h-4 w-4" />
                            Page Content
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {viewTab === 'details' ? (
                        <div className="p-6 bg-white dark:bg-gray-900">
                          {/* Highlight Details */}
                          <div className="max-w-4xl mx-auto">
                            <div className="space-y-6">
                              {/* Page Info */}
                              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                  {currentHighlight.page_title || 'Untitled Page'}
                                </h1>
                                <a 
                                  href={currentHighlight.page_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                >
                                  {currentHighlight.page_url}
                                </a>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                  Highlighted on {formatDetailedDate(currentHighlight.created_at)}
                                </p>
                              </div>
                              
                              {/* Highlighted Text */}
                              <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Highlighted Text</h2>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                                    {currentHighlight.highlighted_text}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-4 pt-4">
                                <a 
                                  href={currentHighlight.page_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                  Visit Original Page
                                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                                <button
                                  onClick={() => handleDeleteHighlight(currentHighlight.id)}
                                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                  Delete Highlight
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-gray-50 dark:bg-gray-800">
                          {/* Page Content */}
                          <div className="max-w-4xl mx-auto">
                            {/* Content Extraction Status */}
                            {(!currentHighlight.markdown_content || currentHighlight.markdown_content.trim() === '') && currentHighlight.metadata?.content_status !== 'pending' && currentHighlight.metadata?.content_status !== 'extracted' && (
                              <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="text-center">
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Page Content Not Available
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Extract the full page content to view it alongside your highlight.
                                  </p>
                                  {extractionError && (
                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                      <p className="text-sm text-red-600 dark:text-red-400">{extractionError}</p>
                                    </div>
                                  )}
                                  <button
                                    onClick={handleExtractContent}
                                    disabled={isExtracting}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {isExtracting ? (
                                      <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Extracting Content...
                                      </>
                                    ) : (
                                      <>
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Extract Page Content
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            <MarkdownViewer
                              content={currentHighlight.markdown_content || ''}
                              metadata={currentHighlight.metadata}
                              isLoading={isExtracting || ((!currentHighlight.markdown_content || currentHighlight.markdown_content.trim() === '') && currentHighlight.metadata?.content_status === 'pending')}
                            />
                          </div>  
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-8">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Welcome to {appConfig.app.displayName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Select a highlight from the sidebar to view its details, or use the bookmarklet to capture new highlights.
                    </p>
                    <button
                      onClick={handleViewBookmarklet}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Set Up Bookmarklet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Bookmarklet Dashboard */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6">
              <BookmarkletDashboard />
            </div>
          </div>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDeleteHighlight}
        onConfirm={confirmDeleteHighlight}
        title="Delete Highlight"
        message="Are you sure you want to delete this highlight? This will permanently remove it from your collection."
        itemName={highlightToDelete ? `"${highlightToDelete.highlighted_text.substring(0, 50)}${highlightToDelete.highlighted_text.length > 50 ? '...' : ''}"` : undefined}
        isLoading={isDeleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// Export with dynamic import to prevent SSR
export default dynamic(() => Promise.resolve(DashboardContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Dashboard...</p>
      </div>
    </div>
  )
});