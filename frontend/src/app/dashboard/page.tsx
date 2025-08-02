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
import { LogOut, RefreshCw, Bookmark, FileText, Edit3, BookOpen, User } from 'lucide-react';
import { BookmarkletDashboard } from '@/components/BookmarkletDashboard';
import { useContentExtraction } from '@/hooks';
import { formatDetailedDate } from '@/lib/dateUtils';
import appConfig from '../../../config.json';

function DashboardContent() {
  const { user, signOut: supabaseSignOut } = useAuth();
  const { toasts, dismissToast } = useToasts();
  const { extractContent, isExtracting, extractionError, clearError } = useContentExtraction();
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
  
  // Form state for inline editing
  const [formData, setFormData] = useState({
    highlighted_text: '',
    original_quote: '',
    page_title: '',
    page_url: '',
    markdown_content: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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
    console.log('DASHBOARD DEBUG - handleHighlightSelect called for:', highlightId);
    
    // Clear current highlight first to show loading state
    setCurrentHighlight(null);
    setSelectedHighlight(highlightId);
    
    // Clear any previous extraction errors when switching highlights
    clearError();
    
    // Inline the loadHighlight logic to avoid dependency issues
    const loadHighlight = async () => {
      try {
        console.log('DASHBOARD DEBUG - Fetching highlight from API...');
        const url = `/api/highlights/${encodeURIComponent(highlightId)}`;
        console.log('DASHBOARD DEBUG - Request URL:', url);
        
        const response = await fetch(url, {
          credentials: 'include',
        });
        
        console.log('DASHBOARD DEBUG - Response status:', response.status, response.statusText);
        console.log('DASHBOARD DEBUG - Response ok:', response.ok);
        
        if (!response.ok) {
          console.error('DASHBOARD DEBUG - Response not ok:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });
        }
        
        const result: ApiResponse<Highlight> = await response.json();
        console.log('DASHBOARD DEBUG - API response:', { success: result.success, hasData: !!result.data, error: result.error });
        
        if (result.success && result.data) {
          console.log('DASHBOARD DEBUG - Setting current highlight with content length:', result.data.markdown_content?.length || 0);
          setCurrentHighlight(result.data);
          
          // Initialize form data
          setFormData({
            highlighted_text: result.data.highlighted_text || '',
            original_quote: result.data.original_quote || '',
            page_title: result.data.page_title || '',
            page_url: result.data.page_url || '',
            markdown_content: result.data.markdown_content || ''
          });
          setHasUnsavedChanges(false);
        } else {
          console.error('API error:', result.error);
          setCurrentHighlight(null);
        }
      } catch (err) {
        console.error('DASHBOARD DEBUG - Fetch error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          name: err instanceof Error ? err.name : 'Unknown',
          stack: err instanceof Error ? err.stack : 'No stack'
        });
        setCurrentHighlight(null);
      }
    };
    
    loadHighlight();
  }, [clearError]);

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
      } else {
        throw new Error(result.error || 'Failed to update highlight');
      }
    } catch (error) {
      console.error('Error updating highlight:', error);
      throw error; // Re-throw so the editor can handle it
    }
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check if form has changes compared to current highlight
    if (currentHighlight) {
      const originalData = {
        highlighted_text: currentHighlight.highlighted_text || '',
        original_quote: currentHighlight.original_quote || '',
        page_title: currentHighlight.page_title || '',
        page_url: currentHighlight.page_url || '',
        markdown_content: currentHighlight.markdown_content || ''
      };
      
      const newData = { ...formData, [field]: value };
      const hasChanges = Object.keys(newData).some(key => 
        newData[key as keyof typeof newData] !== originalData[key as keyof typeof originalData]
      );
      
      setHasUnsavedChanges(hasChanges);
    }
  };

  const handleSaveForm = async () => {
    if (!currentHighlight || !hasUnsavedChanges) return;
    
    // Basic validation
    if (!formData.highlighted_text.trim()) {
      alert('Highlighted text is required');
      return;
    }
    
    if (!formData.page_url.trim()) {
      alert('Page URL is required');
      return;
    }
    
    // Validate URL format
    try {
      new URL(formData.page_url);
    } catch {
      alert('Please enter a valid URL');
      return;
    }
    
    try {
      await handleSaveHighlight({
        highlighted_text: formData.highlighted_text.trim(),
        page_title: formData.page_title.trim(),
        page_url: formData.page_url.trim()
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleExtractContent = async () => {
    if (!currentHighlight) return;
    
    console.log('DASHBOARD DEBUG - Starting extraction for highlight:', currentHighlight.id);
    const success = await extractContent(currentHighlight.id);
    console.log('DASHBOARD DEBUG - Extraction completed, success:', success);
    
    // Always refresh the current highlight to get the updated content
    // (either successful extraction or error message saved as content)
    // Note: Don't call handleHighlightSelect because it clears the error
    console.log('DASHBOARD DEBUG - Refreshing highlight data...');
    try {
      const response = await fetch(`/api/highlights/${encodeURIComponent(currentHighlight.id)}`, {
        credentials: 'include',
      });
      
      const result: ApiResponse<Highlight> = await response.json();
      console.log('DASHBOARD DEBUG - API response for refresh:', { success: result.success, hasData: !!result.data });
      
      if (result.success && result.data) {
        console.log('DASHBOARD DEBUG - Setting refreshed highlight with content length:', result.data.markdown_content?.length || 0);
        setCurrentHighlight(result.data);
        
        // Update form data with refreshed content
        setFormData({
          highlighted_text: result.data.highlighted_text || '',
          original_quote: result.data.original_quote || '',
          page_title: result.data.page_title || '',
          page_url: result.data.page_url || '',
          markdown_content: result.data.markdown_content || ''
        });
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Error refreshing highlight:', err);
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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - App name and navigation */}
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {appConfig.app.displayName}
              </h1>
              
              {/* Navigation Links */}
              <nav className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('files')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeTab === 'files'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Highlights
                </button>
                
                <button
                  onClick={() => setActiveTab('bookmarklet')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    activeTab === 'bookmarklet'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  Bookmarklet
                </button>
              </nav>
            </div>

            {/* Right side - Refresh button, user info, and sign out */}
            <div className="flex items-center gap-4">
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

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {user?.name || user?.username || 'Test User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role || 'developer'}
                    </p>
                  </div>
                </div>
              </div>

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
        </div>
      </header>


      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
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
            <div className="flex-1 flex flex-col relative min-h-0">
              {selectedHighlight && !currentHighlight ? (
                /* Loading state when highlight is selected but not yet loaded */
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading highlight...</p>
                  </div>
                </div>
              ) : currentHighlight ? (
                  <div className="flex flex-col h-full">
                    {/* Header with action buttons */}
                    <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
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
                          
                          {/* Desktop spacer */}
                          <div className="hidden lg:block"></div>
                          
                          {/* Action Button Group */}
                          <div className="flex items-center gap-3">
                            <a 
                              href={currentHighlight.page_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                            >
                              Visit Original
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <button
                              onClick={() => handleDeleteHighlight(currentHighlight.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={handleSaveForm}
                              disabled={!hasUnsavedChanges}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                              {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-6 bg-white dark:bg-gray-900">
                        <div className="w-full">
                          <div className="space-y-6">
                            {/* Page Information Section */}
                            <div className="space-y-4">
                              <div>
                                <label htmlFor="page-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Page Title
                                </label>
                                <input
                                  id="page-title"
                                  type="text"
                                  value={formData.page_title}
                                  onChange={(e) => handleFormChange('page_title', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Enter page title..."
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="page-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Page URL
                                </label>
                                <input
                                  id="page-url"
                                  type="url"
                                  value={formData.page_url}
                                  onChange={(e) => handleFormChange('page_url', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="https://example.com"
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="created-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Created On
                                </label>
                                <input
                                  id="created-date"
                                  type="text"
                                  value={formatDetailedDate(currentHighlight.created_at)}
                                  disabled
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                              </div>
                              
                              {/* Original Quote Section - Read Only */}
                              <div>
                                <label htmlFor="original-quote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Original Quote
                                </label>
                                <textarea
                                  id="original-quote"
                                  value={formData.original_quote || '(No original quote available for this highlight)'}
                                  disabled
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed resize-none"
                                />
                              </div>
                            </div>
                            
                            {/* Highlighted Text Section */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Highlighted Text
                              </label>
                              <div className="bg-yellow-25 rounded-md border border-gray-300" style={{backgroundColor: '#fefdf8'}}>
                                <MarkdownViewer
                                  key={`highlighted-${currentHighlight.id}`}
                                  content={formData.highlighted_text}
                                  editable={true}
                                  onChange={(markdown) => handleFormChange('highlighted_text', markdown)}
                                  className="border-0 bg-transparent"
                                />
                              </div>
                            </div>


                            {/* Full Page Content Section */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <label className="text-xl font-semibold text-gray-900 dark:text-white">Full Content</label>
                                <button
                                  onClick={handleExtractContent}
                                  disabled={isExtracting}
                                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isExtracting ? (
                                    <div className="flex items-center justify-center">
                                      <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Extracting...
                                    </div>
                                  ) : (
                                    <>
                                      <BookOpen className="h-4 w-4 mr-2" />
                                      Extract Text
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              {extractionError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                  <p className="text-sm text-red-600 dark:text-red-400">{extractionError}</p>
                                </div>
                              )}
                              
                              <MarkdownViewer
                                key={`content-${currentHighlight.id}`}
                                content={formData.markdown_content}
                                isLoading={isExtracting}
                                editable={true}
                                onChange={(markdown) => handleFormChange('markdown_content', markdown)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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