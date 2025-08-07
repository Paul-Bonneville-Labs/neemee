'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { Auth } from '@/components/Auth';
import { Sidebar } from '@/components/Sidebar';
import { Note, NotesLibraryResponse, ApiResponse, UserApiKey } from '@/types';
import { Edit3, Zap, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToasts, ToastContainer } from '@/components/Toast';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { EmptyLibraryState } from '@/components/library/EmptyLibraryState';
import { useLibraryFilters } from '@/components/library/LibraryFilters';
import { NotesGridView } from '@/components/library/NotesGridView';
import { NotesListView } from '@/components/library/NotesListView';
import appConfig from '../../config.json';

export default function LibraryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, dismissToast, showSuccess, showError } = useToasts();
  
  // Library state
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [apiKey, setApiKey] = useState<UserApiKey | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const loadNotes = useCallback(async () => {
    if (hasLoaded || !user) return;
    
    try {
      setIsLoading(true);
      console.log('Loading notes for user:', user);
      const response = await fetch('/api/notes/list', {
        credentials: 'include',
      });
      console.log('Notes API response status:', response.status);
      const result: ApiResponse<NotesLibraryResponse> = await response.json();
      console.log('Notes API result:', result);
      
      if (result.success && result.data) {
        console.log('Found notes:', result.data.notes?.length || 0);
        setNotes(result.data.notes || []);
        setHasLoaded(true);
      } else {
        console.log('API returned error:', result.error, 'Status:', response.status);
        // Only log errors that aren't authentication-related
        if (response.status !== 401) {
          console.error('Failed to load notes:', result.error);
        }
        // For 401 errors, just mark as loaded so we don't retry
        if (response.status === 401) {
          setHasLoaded(true);
        }
      }
    } catch (err) {
      console.error('Exception loading notes:', err);
      // Handle network errors, but don't spam console for auth issues
      if (err instanceof Error && !err.message.includes('401')) {
        console.error('Error loading notes:', err);
      }
      setHasLoaded(true); // Prevent infinite retry loops
    } finally {
      setIsLoading(false);
    }
  }, [hasLoaded, user]);

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

  // Load notes and API key when user is authenticated
  useEffect(() => {
    if (user && mounted && !hasLoaded) {
      loadNotes();
    }
    if (user && mounted) {
      loadApiKey();
    }
  }, [user, mounted, hasLoaded, loadNotes, loadApiKey]);

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

  // Use the filtering hook
  const { filteredNotes } = useLibraryFilters({ notes, searchTerm });

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

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="min-h-screen flex">
          {/* Left Side - App Info */}
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {/* Enhanced gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-indigo-600/10 dark:from-blue-400/5 dark:via-purple-400/3 dark:to-indigo-400/5"></div>
            
            {/* Floating orb animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-indigo-500/25 to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            {/* Content container */}
            <div className="relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {appConfig.app.name}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                {appConfig.app.description}
              </p>
              
              {/* Feature Cards */}
              <div className="space-y-6">
                {/* Capture Feature */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-500/20 dark:border-blue-400/20 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        Capture Anywhere
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Highlight text on any website with our intelligent bookmarklet
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                        One-Click
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Processing Feature */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-green-500/20 dark:border-green-400/20 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                        AI Extraction
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        AI automatically identifies entities, relationships, and key concepts
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                        GPT-4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Knowledge Graph Feature */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-500/20 dark:border-purple-400/20 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                        Knowledge Graph
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Build your personal knowledge network and discover connections
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                        Neo4j
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Side - Login Form (Full Height) */}
          <div className="flex-1 flex flex-col justify-center p-8">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-md">
                <Auth onClose={() => {}} showClose={false} />
              </div>
            </div>
          </div>
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
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        apiKey={apiKey}
        onSetupClick={handleSetupClick}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !hasLoaded ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-base-content/70">Loading your library...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <EmptyLibraryState 
            searchTerm={searchTerm}
            apiKey={apiKey}
            onSetupClick={handleSetupClick}
          />
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6 flex justify-end">
              <div className="badge badge-outline text-base-content border-base-content/20 bg-base-200 rounded-full">
                {searchTerm ? (
                  <>Showing {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;</>
                ) : (
                  <>{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} in your library</>
                )}
              </div>
            </div>

            {/* Notes Content */}
            {viewMode === 'grid' ? (
              <NotesGridView 
                notes={filteredNotes}
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
                notes={filteredNotes}
                onToast={(type, message, description) => {
                  if (type === 'success') {
                    showSuccess(message);
                  } else {
                    showError(message, description);
                  }
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}