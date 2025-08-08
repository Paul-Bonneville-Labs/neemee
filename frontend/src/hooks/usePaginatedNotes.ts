import { useState, useCallback, useRef, useEffect } from 'react';
import { Note, NotesLibraryResponse, ApiResponse } from '@/types';

export interface UsePaginatedNotesOptions {
  initialPageSize?: number;
  pageSize?: number;
  searchDebounceMs?: number;
}

export interface UsePaginatedNotesReturn {
  // Data state
  notes: Note[];
  total: number;
  hasMore: boolean;
  
  // Loading states  
  isInitialLoading: boolean;
  isPaginating: boolean;
  error: string | null;
  
  // Actions
  loadMore: () => void;
  search: (term: string) => void;
  refresh: () => void;
  
  // Search state
  searchTerm: string;
  isSearching: boolean;
}

export function usePaginatedNotes(options: UsePaginatedNotesOptions = {}): UsePaginatedNotesReturn {
  const {
    initialPageSize = 20,
    pageSize = 10,
    searchDebounceMs = 300
  } = options;

  // Core state
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs to prevent duplicate requests
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasLoadedInitialRef = useRef(false);

  // Search debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, searchDebounceMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchDebounceMs]);

  // Load notes from API
  const loadNotes = useCallback(async (page: number, isNewSearch = false, searchQuery = '') => {
    // Prevent duplicate requests
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setError(null);
      
      // Set appropriate loading state
      if (page === 1 && !isNewSearch) {
        setIsInitialLoading(true);
      } else if (page > 1) {
        setIsPaginating(true);
      } else if (isNewSearch) {
        setIsSearching(true);
      }

      // Determine page size
      const limit = page === 1 ? initialPageSize : pageSize;
      
      // Build API URL
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const response = await fetch(`/api/notes/list?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load notes: ${response.statusText}`);
      }
      
      const result: ApiResponse<NotesLibraryResponse> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to load notes');
      }
      
      const { notes: newNotes, pagination } = result.data;
      
      // Update state based on request type
      if (page === 1 || isNewSearch) {
        // Replace notes for initial load or new search
        setNotes(newNotes);
        setCurrentPage(1);
      } else {
        // Append notes for pagination, filtering out duplicates
        setNotes(prevNotes => {
          const existingIds = new Set(prevNotes.map(note => note.id));
          const uniqueNewNotes = newNotes.filter(note => !existingIds.has(note.id));
          return [...prevNotes, ...uniqueNewNotes];
        });
      }
      
      // Update pagination state
      setTotal(pagination.total);
      const totalPages = Math.ceil(pagination.total / pageSize);
      setHasMore(page < totalPages);
      
      if (page > 1) {
        setCurrentPage(page);
      }
      
    } catch (err) {
      console.error('Error loading notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      loadingRef.current = false;
      setIsInitialLoading(false);
      setIsPaginating(false);
      setIsSearching(false);
    }
  }, [initialPageSize, pageSize]);

  // Initial load
  useEffect(() => {
    if (!hasLoadedInitialRef.current) {
      hasLoadedInitialRef.current = true;
      loadNotes(1);
    }
  }, [loadNotes]);

  // Handle search changes
  useEffect(() => {
    // Reset pagination and load with search
    setCurrentPage(1);
    setHasMore(true);
    loadNotes(1, true, debouncedSearchTerm);
  }, [debouncedSearchTerm, loadNotes]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (!hasMore || isPaginating || loadingRef.current) return;
    
    const nextPage = currentPage + 1;
    loadNotes(nextPage, false, debouncedSearchTerm);
  }, [hasMore, isPaginating, currentPage, loadNotes, debouncedSearchTerm]);

  // Search function
  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    setNotes([]);
    loadNotes(1, false, debouncedSearchTerm);
  }, [loadNotes, debouncedSearchTerm]);

  return {
    // Data
    notes,
    total,
    hasMore,
    
    // Loading states
    isInitialLoading,
    isPaginating,
    error,
    
    // Actions
    loadMore,
    search,
    refresh,
    
    // Search state
    searchTerm,
    isSearching: isSearching || (searchTerm !== debouncedSearchTerm)
  };
}