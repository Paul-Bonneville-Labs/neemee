import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  error?: string | null;
  onRetry?: () => void;
  triggerDistance?: number;
  className?: string;
}

export function InfiniteScrollContainer({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  error,
  onRetry,
  triggerDistance = 200,
  className = ''
}: InfiniteScrollContainerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Create intersection observer
  const createObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Only trigger load more if:
        // 1. Sentinel is intersecting (visible)
        // 2. We have more content to load
        // 3. We're not already loading
        // 4. There's no error
        if (entry.isIntersecting && hasMore && !isLoading && !error) {
          onLoadMore();
        }
      },
      {
        // Trigger when sentinel is within triggerDistance of viewport
        rootMargin: `${triggerDistance}px`,
        threshold: 0
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [hasMore, isLoading, error, onLoadMore, triggerDistance]);

  // Set up observer
  useEffect(() => {
    createObserver();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [createObserver]);

  // Recreate observer when dependencies change
  useEffect(() => {
    createObserver();
  }, [createObserver]);

  return (
    <div className={className}>
      {children}
      
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="w-full h-4" />
      
      {/* Loading indicator */}
      {isLoading && hasMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-base-content/70">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading more notes...</span>
          </div>
        </div>
      )}
      
      {/* Error state with retry */}
      {error && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-center mb-4">
            <p className="text-error text-sm mb-2">Failed to load more notes</p>
            <p className="text-base-content/60 text-xs">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-sm btn-outline btn-error"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </button>
          )}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && !error && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-base-content/50 text-sm">
              You've reached the end
            </p>
            <p className="text-base-content/30 text-xs mt-1">
              No more notes to load
            </p>
          </div>
        </div>
      )}
      
      {/* Fallback Load More button (in case scroll detection fails) */}
      {hasMore && !isLoading && !error && (
        <div className="flex items-center justify-center py-4">
          <button
            onClick={onLoadMore}
            className="btn btn-ghost btn-sm text-base-content/70 hover:text-base-content"
          >
            Load More Notes
          </button>
        </div>
      )}
    </div>
  );
}

// Skeleton loading components for initial load
export function NotesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card bg-base-200 shadow-sm">
          <div className="card-body pt-6 px-6 pb-4">
            {/* Content skeleton */}
            <div className="space-y-2">
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-5/6"></div>
              <div className="skeleton h-4 w-4/6"></div>
            </div>
            
            {/* Time skeleton */}
            <div className="mt-4">
              <div className="skeleton h-3 w-16"></div>
            </div>
          </div>
          
          {/* Footer skeleton */}
          <div className="card-footer p-4 bg-base-300 rounded-b-lg">
            <div className="space-y-2">
              <div className="skeleton h-4 w-3/4"></div>
              <div className="skeleton h-6 w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotesListSkeleton() {
  return (
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
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              <td className="align-top">
                <div className="skeleton h-4 w-12"></div>
              </td>
              <td className="align-top">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-4/5"></div>
                </div>
              </td>
              <td className="align-top">
                <div className="skeleton h-6 w-32"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}