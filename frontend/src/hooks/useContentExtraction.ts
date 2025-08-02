import { useState, useCallback } from 'react';

interface UseContentExtractionResult {
  extractContent: (highlightId: string) => Promise<boolean>;
  isExtracting: boolean;
  extractionError: string | null;
  clearError: () => void;
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

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        result = {};
      }
      


      if (!response.ok) {
        // Extract the error message (should already be formatted with Firecrawl status)
        let errorMessage = 'Content extraction failed';
        if (result && typeof result === 'object') {
          if (result.error) {
            errorMessage = result.error;
          } else if (result.message) {
            errorMessage = result.message;
          } else if (result.details) {
            // Check for errors array first (this is where the Firecrawl errors are)
            if (result.details.errors && Array.isArray(result.details.errors)) {
              errorMessage = result.details.errors.join(' - ');
            } else if (typeof result.details === 'string') {
              errorMessage = result.details;
            } else if (result.details.error) {
              errorMessage = result.details.error;
            } else if (result.details.message) {
              errorMessage = result.details.message;
            } else {
              errorMessage = `Content extraction failed: ${JSON.stringify(result.details)}`;
            }
          }
        }
        
        // Don't add extra status codes - the error message should already contain the Firecrawl status
        throw new Error(errorMessage);
      }

      if (result && result.status === 'error') {
        throw new Error(result.errors?.join(', ') || 'Content extraction failed - no error details provided');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content extraction failed';
      setExtractionError(errorMessage);
      return false;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setExtractionError(null);
  }, []);

  return {
    extractContent,
    isExtracting,
    extractionError,
    clearError
  };
}