import { useState, useCallback } from 'react';
import { Highlight } from '@/types';

interface UseContentExtractionResult {
  extractContent: (highlightId: string) => Promise<boolean>;
  isExtracting: boolean;
  extractionError: string | null;
}

export function useContentExtraction(): UseContentExtractionResult {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const extractContent = useCallback(async (highlightId: string): Promise<boolean> => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const response = await fetch(`/api/highlights/${highlightId}/extract-content`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();
      
      console.log('API Response:', { 
        status: response.status, 
        ok: response.ok, 
        result 
      });

      if (!response.ok) {
        console.error('API Error Response:', result);
        throw new Error(result.error || 'Content extraction failed');
      }

      if (result.status === 'error') {
        throw new Error(result.errors?.join(', ') || 'Content extraction failed');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content extraction failed';
      setExtractionError(errorMessage);
      console.error('Content extraction failed:', error);
      return false;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return {
    extractContent,
    isExtracting,
    extractionError
  };
}