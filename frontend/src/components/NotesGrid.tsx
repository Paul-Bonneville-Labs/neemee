'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter,
  Grid,
  List,
  Loader2
} from 'lucide-react';
import { Note } from '@/types';
import { NoteCard, NoteCardSkeleton } from './NoteCard';

type DateFilter = 'all' | 'today' | 'week' | 'month';
type SortOption = 'recent' | 'oldest' | 'alphabetical';

interface NotesGridProps {
  notes: Note[];
  selectedNote?: string;
  onNoteSelect: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  className?: string;
}

export function NotesGrid({ 
  notes,
  selectedNote,
  onNoteSelect,
  onDeleteNote, // eslint-disable-line @typescript-eslint/no-unused-vars
  onRefresh,
  isLoading = false,
  viewMode = 'grid',
  onViewModeChange,
  searchTerm = '',
  onSearchChange,
  className = ''
}: NotesGridProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Filter notes based on search and date
  const filteredNotes = notes.filter(note => {
    // Search filter
    if (searchTerm) {
      const searchableText = [
        note.content || '',
        note.snippet || '',
        note.page_title || '',
        note.page_url || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Date filter
    if (dateFilter === 'all') return true;

    const createdDate = new Date(note.created_at);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;

    switch (dateFilter) {
      case 'today':
        return now.getTime() - createdDate.getTime() < dayInMs;
      case 'week':
        return now.getTime() - createdDate.getTime() < 7 * dayInMs;
      case 'month':
        return now.getTime() - createdDate.getTime() < 30 * dayInMs;
      default:
        return true;
    }
  });

  // Sort filtered notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'alphabetical':
        const titleA = (a.page_title || 'Untitled').toLowerCase();
        const titleB = (b.page_title || 'Untitled').toLowerCase();
        return titleA.localeCompare(titleB);
      default:
        return 0;
    }
  });

  const handleNoteClick = (noteId: string) => {
    onNoteSelect(noteId);
  };

  // Loading state
  if (isLoading && notes.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Search and Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 
                       bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm ? (
                <>
                  {sortedNotes.length} result{sortedNotes.length !== 1 ? 's' : ''} 
                  {searchTerm && ` for "${searchTerm}"`}
                </>
              ) : (
                <>{sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''} in library</>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-2 ${viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  } transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`p-2 ${viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  } transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recent">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid/List */}
      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm || dateFilter !== 'all' ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {searchTerm || dateFilter !== 'all' 
              ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
              : 'Start building your knowledge base by capturing your first note.'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => handleNoteClick(note.id)}
              viewMode={viewMode}
              className={selectedNote === note.id ? 'ring-2 ring-blue-500' : ''}
            />
          ))}
          
          {/* Loading skeleton cards while fetching more */}
          {isLoading && notes.length > 0 && (
            <>
              {[...Array(4)].map((_, i) => (
                <NoteCardSkeleton key={`skeleton-${i}`} viewMode={viewMode} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NotesGrid;