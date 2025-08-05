'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { Auth } from '@/components/Auth';
import { Note, NotesLibraryResponse, ApiResponse } from '@/types';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import appConfig from '../../config.json';

export default function LibraryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  
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
      const response = await fetch('/api/highlights/list', {
        credentials: 'include',
      });
      const result: ApiResponse<NotesLibraryResponse> = await response.json();
      
      if (result.success && result.data) {
        setNotes(result.data.notes || result.data.highlights || []); // Backward compatibility
        setHasLoaded(true);
      } else {
        console.error('Failed to load notes:', result.error);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
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
      note.content || note.highlighted_text || '', // Backward compatibility
      note.snippet || note.original_quote || '', // Backward compatibility  
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
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {appConfig.app.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {appConfig.app.description}
            </p>
            
            <div className="mb-12 space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium">Capture notes anywhere</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">AI extracts entities & relationships</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-6">
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                <span className="text-sm font-medium">Build your knowledge graph</span>
              </div>

              <div className="max-w-md mx-auto">
                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             placeholder-gray-500 dark:placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowAuth(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium
                             bg-gray-900 hover:bg-gray-800 focus:bg-gray-800
                             border border-transparent rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                             transition-colors duration-200"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-md">
                <Auth onClose={() => setShowAuth(false)} showClose={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main library view for authenticated users
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {appConfig.app.name}
              </h1>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Library</span>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Note Button */}
              <button 
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium
                         bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                         border border-transparent rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
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
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium
                       bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                       border border-transparent rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Your First Note
            </button>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? (
                  <>Showing {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''} for "{searchTerm}"</>
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
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6
                           hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 
                           cursor-pointer transition-all duration-200"
                >
                  {/* Note preview content */}
                  <div className="mb-4">
                    <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed line-clamp-4">
                      {note.snippet || note.original_quote || note.content || note.highlighted_text || 'No content'}
                    </p>
                  </div>

                  {/* Note metadata */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {note.page_title && (
                      <div className="font-medium truncate">{note.page_title}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        {note.page_url ? new URL(note.page_url).hostname : 'Unknown source'}
                      </span>
                      <span className="whitespace-nowrap ml-2">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
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