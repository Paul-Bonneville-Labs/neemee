'use client';

import { Note } from '@/types';
import { ExternalLink, Globe, Clock } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

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

export function NoteCard({ note, onClick, viewMode = 'grid', className = '' }: NoteCardProps) {
  // Get displayable content
  const content = note.snippet || note.content || 'No content';
  const title = note.page_title || 'Untitled';
  const domain = note.page_url ? (() => {
    try {
      return new URL(note.page_url).hostname;
    } catch {
      return 'Unknown source';
    }
  })() : 'Unknown source';
  
  const createdDate = new Date(note.created_at);
  const isRecent = Date.now() - createdDate.getTime() < 24 * 60 * 60 * 1000; // Last 24 hours

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4
                   hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 
                   cursor-pointer transition-all duration-200 ${className}`}
      >
        <div className="flex gap-4">
          {/* Content Preview */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                {title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                {content}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <img 
                  src={getFaviconUrl(domain)} 
                  alt="" 
                  className="w-3 h-3 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'inline';
                  }}
                />
                <Globe className="w-3 h-3 hidden" />
                <span className="truncate max-w-32">{domain}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(createdDate)}</span>
                {isRecent && (
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs ml-1">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Indicator */}
          <div className="flex-shrink-0 flex items-center">
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6
                 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 
                 cursor-pointer transition-all duration-200 group ${className}`}
    >
      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed line-clamp-4">
          {content}
        </p>
      </div>

      {/* Note Metadata */}
      <div className="space-y-2">
        {/* Title */}
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </div>

        {/* Source and Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1 truncate flex-1 mr-2">
            <img 
              src={getFaviconUrl(domain)} 
              alt="" 
              className="w-3 h-3 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'inline';
              }}
            />
            <Globe className="w-3 h-3 flex-shrink-0 hidden" />
            <span className="truncate">{domain}</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(createdDate)}</span>
          </div>
        </div>

        {/* Recent Badge */}
        {isRecent && (
          <div className="flex justify-end">
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
              New
            </span>
          </div>
        )}
      </div>

      {/* Hover Indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Click to view details
          </span>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for NoteCard
export function NoteCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;