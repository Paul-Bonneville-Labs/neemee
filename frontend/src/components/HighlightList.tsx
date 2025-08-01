'use client';

import { useState } from 'react';
import { 
  BookmarkIcon, 
  EyeIcon, 
  TrashIcon, 
  SearchIcon, 
  UserIcon, 
  GlobeIcon,
  CalendarIcon,
  FilterIcon,
  RefreshCwIcon
} from 'lucide-react';
import { HighlightListProps } from '@/types';
import { formatDateTime, isRecent as isRecentDate } from '@/lib/dateUtils';

type DateFilter = 'all' | 'today' | 'week' | 'month';
type SortOption = 'recent' | 'oldest' | 'alphabetical';

export function HighlightList({ 
  highlights, 
  selectedHighlight, 
  onHighlightSelect, 
  onDeleteHighlight,
  onViewBookmarklet, 
  onRefresh,
  isLoading = false,
  sidebarWidth,
  userInfo 
}: HighlightListProps & { sidebarWidth?: number; userInfo?: { name?: string; role?: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Filter highlights based on search and date
  const filteredHighlights = highlights.filter(highlight => {
    const matchesSearch = 
      highlight.highlighted_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      highlight.page_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      highlight.page_url.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === 'all') return true;

    const createdDate = new Date(highlight.created_at);
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

  // Sort highlights
  const sortedHighlights = [...filteredHighlights].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'alphabetical':
        return (a.page_title || a.page_url).localeCompare(b.page_title || b.page_url);
      default:
        return 0;
    }
  });

  // Group highlights by domain
  const groupedHighlights = sortedHighlights.reduce((groups, highlight) => {
    try {
      const domain = new URL(highlight.page_url).hostname;
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(highlight);
      return groups;
    } catch {
      // Fallback for invalid URLs
      const fallbackDomain = 'Unknown Domain';
      if (!groups[fallbackDomain]) {
        groups[fallbackDomain] = [];
      }
      groups[fallbackDomain].push(highlight);
      return groups;
    }
  }, {} as Record<string, typeof highlights>);

  // Use imported utility functions for date formatting

  // Get domain favicon URL
  const getDomainFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return null;
    }
  };

  // Truncate text for preview
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Sort domains: put domains with recent highlights first
  const sortedDomains = Object.keys(groupedHighlights).sort((a, b) => {
    const aHasRecent = groupedHighlights[a].some(h => isRecentDate(h.created_at));
    const bHasRecent = groupedHighlights[b].some(h => isRecentDate(h.created_at));
    
    if (aHasRecent && !bHasRecent) return -1;
    if (!aHasRecent && bHasRecent) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Highlights
          </h2>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                         transition-colors duration-200 disabled:opacity-50"
                title="Refresh highlights"
              >
                <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredHighlights.length}
            </span>
          </div>
        </div>
        
        {/* View Bookmarklet Button */}
        <button
          onClick={onViewBookmarklet}
          disabled={isLoading}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium 
                   text-white bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                   border border-transparent rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
          <BookmarkIcon className="h-4 w-4" />
          View Bookmarklet
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search highlights, titles, or URLs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     border border-gray-200 dark:border-gray-700 rounded-md
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 
                     hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <FilterIcon className="h-3 w-3" />
            Filters
          </button>
          {(dateFilter !== 'all' || sortBy !== 'recent') && (
            <button
              onClick={() => {
                setDateFilter('all');
                setSortBy('recent');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="w-full text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                         rounded px-2 py-1 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                         rounded px-2 py-1 text-gray-900 dark:text-gray-100"
              >
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest first</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Highlight List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading highlights...</p>
          </div>
        ) : filteredHighlights.length === 0 ? (
          <div className="p-4 text-center">
            <BookmarkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {searchTerm ? 'No highlights match your search' : 'No highlights yet'}
            </p>
            {!searchTerm && (
              <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                <p>Install and use the bookmarklet to capture</p>
                <p>highlighted text from any website</p>
                <button
                  onClick={onViewBookmarklet}
                  className="text-blue-600 dark:text-blue-400 hover:underline mt-2"
                >
                  View setup instructions
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 overflow-hidden">
            {sortedDomains.map((domain) => (
              <div key={domain} className="mb-4">
                {/* Domain Header */}
                <div className="flex items-center gap-2 px-2 py-1 mb-2 min-w-0">
                  {getDomainFavicon(groupedHighlights[domain][0].page_url) ? (
                    <img
                      src={getDomainFavicon(groupedHighlights[domain][0].page_url)!}
                      alt=""
                      className="h-4 w-4 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <GlobeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" style={{display: getDomainFavicon(groupedHighlights[domain][0].page_url) ? 'none' : 'block'}} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate min-w-0">
                    {domain}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                    ({groupedHighlights[domain].length})
                  </span>
                  {groupedHighlights[domain].some(h => isRecentDate(h.created_at)) && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" title="Has recent highlights" />
                  )}
                </div>
                
                {/* Highlights in this domain */}
                <div className="ml-4 space-y-1">
                  {groupedHighlights[domain].map((highlight) => (
                    <div
                      key={highlight.id}
                      className={`group relative rounded-md border transition-colors duration-200 ${
                        selectedHighlight === highlight.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <button
                        onClick={() => onHighlightSelect(highlight.id)}
                        className="w-full text-left p-3"
                        title={highlight.highlighted_text}
                      >
                        <div className="space-y-2">
                          {/* Highlight preview */}
                          <p className={`text-sm font-medium leading-relaxed ${
                            selectedHighlight === highlight.id
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {truncateText(highlight.highlighted_text)}
                          </p>
                          
                          {/* Page title and URL */}
                          <div className="space-y-1">
                            {highlight.page_title && (
                              <p className={`text-xs font-medium truncate ${
                                selectedHighlight === highlight.id
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {highlight.page_title}
                              </p>
                            )}
                            <p className={`text-xs truncate ${
                              selectedHighlight === highlight.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {highlight.page_url}
                            </p>
                            
                            {/* Date and time row */}
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center gap-1 text-xs ${
                                selectedHighlight === highlight.id
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <CalendarIcon className="h-3 w-3" />
                                <span>{formatDateTime(highlight.created_at, { includeTime: true, relativeDates: true })}</span>
                              </div>
                              {isRecentDate(highlight.created_at) && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" title="Recent" />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onHighlightSelect(highlight.id);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 
                                     bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-600
                                     transition-colors duration-200"
                            title="View highlight"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteHighlight(highlight.id);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 
                                     bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-600
                                     transition-colors duration-200"
                            title="Delete highlight"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="fixed bottom-0 left-0 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10"
        style={{ width: sidebarWidth || 320 }}
      >
        <div className="flex items-center justify-start gap-2 text-xs">
          <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
            {userInfo?.name || 'Loading...'}
          </span>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium flex-shrink-0">
            {userInfo?.role || 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
}