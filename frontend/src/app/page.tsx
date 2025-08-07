'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { Auth } from '@/components/Auth';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { Sidebar, HamburgerButton } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Note, NotesLibraryResponse, ApiResponse, UserApiKey } from '@/types';
import { Search, Plus, Grid, List, Clock, Globe, Edit3, Zap, Network, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToasts, ToastContainer } from '@/components/Toast';
import appConfig from '../../config.json';

// Utility function to get favicon URL for a domain
function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
}

// Utility function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

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

  // Filter notes based on search
  const filteredNotes = notes.filter(note => {
    const searchableText = [
      note.content || '',
      note.snippet || '',
      note.page_title || '',
      note.page_url || ''
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm.toLowerCase());
  });

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
      <header className="sticky top-0 z-30 bg-base-100/50 backdrop-blur-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Hamburger */}
            <div className="flex items-center gap-3">
              <HamburgerButton 
                isOpen={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
              <Link href="/" className="text-2xl font-bold text-base-content hover:text-primary transition-colors">
                {appConfig.app.name}
              </Link>
              <span className="ml-2 text-2xl text-base-content/70">Library</span>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="form-control relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-64 pl-10 bg-base-200 text-base-content placeholder:text-base-content/50 focus:bg-base-300 border-base-300 focus:border-primary"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="join">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`join-item btn btn-sm ${viewMode === 'list' ? 'btn-primary' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Setup Bookmarklet Button - Only show if no API key */}
              {!apiKey && (
                <button 
                  onClick={() => router.push('/setup')}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Setup Bookmarklet
                </button>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Profile Menu */}
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>

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
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-base-content/50" />
            </div>
            <h2 className="text-xl font-semibold text-base-content mb-2">
              {searchTerm ? 'No notes found' : 'Your library is empty'}
            </h2>
            <p className="text-base-content/70 mb-4 text-center max-w-md">
              {searchTerm 
                ? `No notes match "${searchTerm}". Try a different search term.`
                : apiKey 
                  ? 'Start capturing highlights from any website using your bookmarklet.'
                  : 'Start building your knowledge base by capturing your first note.'
              }
            </p>
            {!apiKey && (
              <button 
                onClick={() => router.push('/setup')}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Setup Bookmarklet
              </button>
            )}
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const mouseX = e.clientX - centerX;
                    const mouseY = e.clientY - centerY;
                    const rotateX = (mouseY / rect.height) * -8;
                    const rotateY = (mouseX / rect.width) * 8;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                  }}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.02)';
                  }}
                  className="card bg-base-200 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 ease-out transform-gpu"
                >
                  {/* Card Body - Note preview content */}
                  <div className="card-body pt-6 px-6 pb-4">
                    <p className="text-base-content text-sm leading-relaxed line-clamp-5 font-bold italic">
                      {note.snippet || note.content || 'No content'}
                    </p>
                    <div className="text-left">
                      <div className="tooltip tooltip-top tooltip-left tooltip-delayed z-50" data-tip={new Date(note.created_at).toLocaleString()}>
                        <div className="inline-flex items-center gap-1 text-xs text-base-content/70 cursor-help">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(new Date(note.created_at))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer - Metadata */}
                  <div className="card-footer p-4 bg-base-300 rounded-b-lg">
                    <div className="space-y-2 text-xs text-base-content/70">
                      {/* Page Title */}
                      {note.page_title && (
                        <div className="tooltip tooltip-top w-full tooltip-delayed z-50" data-tip={note.page_title}>
                          <div className="font-bold text-base-content truncate cursor-help">
                            {note.page_title}
                          </div>
                        </div>
                      )}
                      
                      {/* Domain Row */}
                      <div className="flex items-center">
                        <div className="tooltip tooltip-top flex-1 tooltip-delayed z-50" data-tip={note.page_url || 'Unknown source'}>
                          <div 
                            className="badge gap-1 cursor-pointer rounded-full bg-base-100 hover:bg-base-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (note.page_url) {
                                navigator.clipboard.writeText(note.page_url).then(() => {
                                  // Show success toast
                                  showSuccess('URL copied to clipboard');
                                  
                                  // Optional: Show a brief visual feedback on badge
                                  const badge = e.currentTarget as HTMLElement;
                                  if (badge) {
                                    const originalClasses = badge.className;
                                    badge.className = badge.className.replace('bg-base-100', 'bg-success');
                                    setTimeout(() => {
                                      badge.className = originalClasses;
                                    }, 200);
                                  }
                                }).catch(err => {
                                  console.error('Failed to copy URL:', err);
                                  showError('Failed to copy URL', 'Please try again');
                                });
                              }
                            }}
                          >
                            <img 
                              src={getFaviconUrl(note.page_url ? new URL(note.page_url).hostname : 'Unknown source')} 
                              alt="" 
                              className="w-3 h-3 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) nextElement.style.display = 'inline';
                              }}
                            />
                            <Globe className="w-3 h-3 flex-shrink-0 hidden" />
                            <span className="truncate">
                              {note.page_url ? new URL(note.page_url).hostname : 'Unknown source'}
                            </span>
                            <Copy className="w-3 h-3 flex-shrink-0 opacity-60 hover:opacity-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm table-zebra">
                  <thead>
                    <tr>
                      <th className="w-16">Time</th>
                      <th>Content</th>
                      <th className="w-48">Domain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.map((note) => (
                      <tr 
                        key={note.id}
                        className="hover:bg-base-200 cursor-pointer"
                        onClick={() => router.push(`/notes/${note.id}`)}
                      >
                        {/* Time Column */}
                        <td className="text-sm whitespace-nowrap">
                          <div 
                            className="tooltip tooltip-right tooltip-delayed"
                            data-tip={new Date(note.created_at).toLocaleString()}
                          >
                            <time className="text-base-content/70 text-xs">
                              {formatRelativeTime(new Date(note.created_at))}
                            </time>
                          </div>
                        </td>

                        {/* Content Column */}
                        <td className="max-w-0 w-full">
                          <div className="space-y-1">
                            <div className="line-clamp-2">
                              <span className="italic text-base-content/80 text-sm">
                                "{note.snippet || note.content || 'No content'}"
                              </span>
                            </div>
                            {/* Page Title */}
                            {note.page_title && (
                              <div className="text-sm font-bold text-base-content whitespace-normal break-words">
                                {note.page_title}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Source Column (Domain Only) */}
                        <td className="w-48">
                          {/* Domain Badge */}
                          {note.page_url && (
                            <div className="tooltip tooltip-top flex-1 tooltip-delayed" data-tip={note.page_url || 'Unknown source'}>
                              <div 
                                className="badge gap-1 cursor-pointer rounded-full bg-base-100 hover:bg-base-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (note.page_url) {
                                    navigator.clipboard.writeText(note.page_url).then(() => {
                                      showSuccess('URL copied to clipboard');
                                      
                                      const badge = e.currentTarget as HTMLElement;
                                      if (badge) {
                                        const originalClasses = badge.className;
                                        badge.className = badge.className.replace('bg-base-100', 'bg-success');
                                        setTimeout(() => {
                                          badge.className = originalClasses;
                                        }, 200);
                                      }
                                    }).catch(err => {
                                      console.error('Failed to copy URL:', err);
                                      showError('Failed to copy URL', 'Please try again');
                                    });
                                  }
                                }}
                              >
                                <img 
                                  src={getFaviconUrl(note.page_url ? new URL(note.page_url).hostname : 'Unknown source')} 
                                  alt="" 
                                  className="w-3 h-3 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextElement) nextElement.style.display = 'inline';
                                  }}
                                />
                                <Globe className="w-3 h-3 flex-shrink-0 hidden" />
                                <span className="truncate">
                                  {note.page_url ? new URL(note.page_url).hostname : 'Unknown source'}
                                </span>
                                <Copy className="w-3 h-3 flex-shrink-0 opacity-60 hover:opacity-100" />
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}