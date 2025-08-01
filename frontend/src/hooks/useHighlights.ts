'use client';

import { useState, useEffect, useCallback } from 'react';
import { Highlight, HighlightListResponse, ApiResponse } from '@/types';

interface UseHighlightsOptions {
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseHighlightsReturn {
  highlights: Highlight[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  } | null;
  refresh: () => Promise<void>;
  deleteHighlight: (highlightId: string) => Promise<boolean>;
}

export function useHighlights(options: UseHighlightsOptions = {}): UseHighlightsReturn {
  const {
    page = 1,
    limit = 50,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
  } | null>(null);

  const fetchHighlights = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`/api/highlights/list?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch highlights: ${response.status}`);
      }

      const data: ApiResponse<HighlightListResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to load highlights');
      }

      setHighlights(data.data.highlights);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Error fetching highlights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load highlights');
      setHighlights([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchHighlights();
  }, [fetchHighlights]);

  const deleteHighlight = useCallback(async (highlightId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/highlights/${highlightId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete highlight: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete highlight');
      }

      // Remove the deleted highlight from the local state
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      
      // Update pagination total count
      if (pagination) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total - 1
        } : null);
      }

      return true;
    } catch (err) {
      console.error('Error deleting highlight:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete highlight');
      return false;
    }
  }, [pagination]);

  // Initial fetch
  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHighlights();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchHighlights]);

  return {
    highlights,
    isLoading,
    error,
    pagination,
    refresh,
    deleteHighlight
  };
}