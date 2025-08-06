'use client';

import { useState, useEffect, useCallback } from 'react';
import { Note, NotesLibraryResponse, ApiResponse } from '@/types';

interface UseNotesOptions {
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  } | null;
  refresh: () => Promise<void>;
  deleteNote: (noteId: string) => Promise<boolean>;
}

export function useNotes(options: UseNotesOptions = {}): UseNotesReturn {
  const {
    page = 1,
    limit = 50,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
  } | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`/api/notes/list?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }

      const data: ApiResponse<NotesLibraryResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to load notes');
      }

      setNotes(data.data.notes);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      setNotes([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNotes();
  }, [fetchNotes]);

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete note');
      }

      // Remove the deleted note from the local state
      setNotes(prev => prev.filter(n => n.id !== noteId));
      
      // Update pagination total count
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total - 1
        } : null);
      }

      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      return false;
    }
  }, [pagination]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotes();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    pagination,
    refresh,
    deleteNote
  };
}