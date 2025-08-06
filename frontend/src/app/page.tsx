'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { Auth } from '@/components/Auth';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { Sidebar, HamburgerButton } from '@/components/Sidebar';
import { Note, NotesLibraryResponse, ApiResponse } from '@/types';
import { Search, Plus, Grid, List, Clock, Globe, Edit3, Zap, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  
  // Library state
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Load notes when user is authenticated
  useEffect(() => {
    if (user && mounted && !hasLoaded) {
      loadNotes();
    }
  }, [user, mounted, hasLoaded, loadNotes]);

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
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Hamburger */}
            <div className="flex items-center gap-3">
              <HamburgerButton 
                isOpen={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {appConfig.app.name}
              </h1>
              <span className="ml-2 text-2xl text-gray-500 dark:text-gray-400">Library</span>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="form-control relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <input
                  type="text"
                  placeholder="Search library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="no-border w-64 pl-10 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:bg-gray-200 dark:focus:bg-gray-700 transition-colors"
                  style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors duration-200 ${viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors duration-200 ${viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Note Button */}
              <button 
                onClick={() => router.push('/setup')}
                className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium
                         bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                         border border-transparent rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Setup Bookmarklet
              </button>

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
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? 'No notes found' : 'Your library is empty'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
              {searchTerm 
                ? `No notes match "${searchTerm}". Try a different search term.`
                : 'Start building your knowledge base by capturing your first note.'
              }
            </p>
            <button 
              onClick={() => router.push('/setup')}
              className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium
                       bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                       border border-transparent rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Setup Bookmarklet
            </button>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? (
                  <>Showing {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;</>
                ) : (
                  <>{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} in your library</>
                )}
              </p>
            </div>

            {/* Notes Grid */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
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
                  className="card bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 ease-out transform-gpu"
                >
                  {/* Card Body - Note preview content */}
                  <div className="card-body p-6 pb-3">
                    <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed line-clamp-4 font-bold italic">
                      {note.snippet || note.content || 'No content'}
                    </p>
                  </div>

                  {/* Card Footer - Metadata */}
                  <div className="card-footer px-6 pb-6 pt-0 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      {/* Page Title */}
                      {note.page_title && (
                        <div className="font-medium text-gray-700 dark:text-gray-300 truncate">
                          {note.page_title}
                        </div>
                      )}
                      
                      {/* Domain and Date Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 truncate flex-1">
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
                        </div>
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(new Date(note.created_at))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}