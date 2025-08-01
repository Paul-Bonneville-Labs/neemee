'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Globe,
  FileText,
  Clock,
  RefreshCw,
  Eye,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { HighlightListResponse, Highlight } from '@/types';
import { formatDateTime } from '@/lib/dateUtils';

interface HighlightStatsProps {
  highlights: HighlightListResponse | null;
  onRefresh?: () => void;
  className?: string;
}

interface DomainStat {
  domain: string;
  count: number;
  percentage: number;
  recentCount: number;
}

interface ActivityStat {
  date: string;
  count: number;
}

export function HighlightStats({ highlights, onRefresh, className = '' }: HighlightStatsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const stats = useMemo(() => {
    if (!highlights?.highlights) {
      return {
        total: 0,
        thisWeek: 0,
        thisMonth: 0,
        domains: [],
        activity: [],
        recent: []
      };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter highlights by period
    const thisWeekHighlights = highlights.highlights.filter(h => 
      new Date(h.created_at) >= weekAgo
    );
    const thisMonthHighlights = highlights.highlights.filter(h => 
      new Date(h.created_at) >= monthAgo
    );

    // Calculate domain statistics
    const domainCounts = highlights.highlights.reduce((acc, highlight) => {
      try {
        const url = new URL(highlight.page_url);
        const domain = url.hostname.replace('www.', '');
        acc[domain] = (acc[domain] || 0) + 1;
      } catch {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const domainStats: DomainStat[] = Object.entries(domainCounts)
      .map(([domain, count]) => {
        const recentCount = thisWeekHighlights.filter(h => {
          try {
            const url = new URL(h.page_url);
            return url.hostname.replace('www.', '') === domain;
          } catch {
            return domain === 'Unknown';
          }
        }).length;

        return {
          domain,
          count,
          percentage: (count / highlights.highlights.length) * 100,
          recentCount
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate daily activity for the selected period
    const periodHighlights = selectedPeriod === 'week' ? thisWeekHighlights :
                           selectedPeriod === 'month' ? thisMonthHighlights :
                           highlights.highlights;

    const activityByDate = periodHighlights.reduce((acc, highlight) => {
      const date = new Date(highlight.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activity: ActivityStat[] = Object.entries(activityByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: highlights.highlights.length,
      thisWeek: thisWeekHighlights.length,
      thisMonth: thisMonthHighlights.length,
      domains: domainStats,
      activity,
      recent: highlights.highlights.slice(0, 5)
    };
  }, [highlights, selectedPeriod]);

  // Use imported utility function for consistent date formatting

  const getDomainIcon = (domain: string) => {
    const lowerDomain = domain.toLowerCase();
    if (lowerDomain.includes('github')) return '⚡';
    if (lowerDomain.includes('stackoverflow')) return '🔧';
    if (lowerDomain.includes('medium')) return '📝';
    if (lowerDomain.includes('dev.to')) return '💻';
    if (lowerDomain.includes('youtube')) return '📺';
    if (lowerDomain.includes('twitter') || lowerDomain.includes('x.com')) return '🐦';
    if (lowerDomain.includes('linkedin')) return '💼';
    if (lowerDomain.includes('reddit')) return '🔗';
    return '🌐';
  };

  if (!highlights) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Statistics will appear here once you start capturing highlights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Highlight Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Insights into your reading and highlighting patterns
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh statistics"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Highlights
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                This Week
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.thisWeek}
                </p>
                {stats.thisWeek > 0 && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
            <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                This Month
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.thisMonth}
                </p>
                {stats.thisMonth > stats.thisWeek && (
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                )}
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      {stats.activity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Activity Over Time
            </h4>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['week', 'month', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    selectedPeriod === period
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          {/* Simple bar chart */}
          <div className="space-y-2">
            {stats.activity.slice(-14).map((day, index) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(5, (day.count / Math.max(...stats.activity.map(d => d.count))) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-6">
                    {day.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Domains */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Top Domains
          </h4>
          
          {stats.domains.length > 0 ? (
            <div className="space-y-3">
              {stats.domains.map((domain, index) => (
                <div key={domain.domain} className="flex items-center gap-3">
                  <span className="text-lg">{getDomainIcon(domain.domain)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {domain.domain}
                      </span>
                      <div className="flex items-center gap-2">
                        {domain.recentCount > 0 && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                            +{domain.recentCount} recent
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {domain.count}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${domain.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No domain data available yet
              </p>
            </div>
          )}
        </div>

        {/* Recent Highlights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Recent Highlights
            </h4>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              View All
            </button>
          </div>
          
          {stats.recent.length > 0 ? (
            <div className="space-y-3">
              {stats.recent.map((highlight, index) => (
                <div key={highlight.id} className="group">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white font-medium truncate mb-1">
                        {highlight.page_title || 'Untitled Page'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {highlight.highlighted_text.substring(0, 120)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(highlight.created_at, { includeTime: true, relativeDates: true })}
                        </span>
                        <button
                          onClick={() => window.open(highlight.page_url, '_blank')}
                          className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1 transition-opacity"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No recent highlights found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            📊 Quick Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-indigo-800 dark:text-indigo-200">
                <strong>Most Active Domain:</strong> {stats.domains[0]?.domain || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-indigo-800 dark:text-indigo-200">
                <strong>Weekly Average:</strong> {Math.round(stats.total / 4)} highlights
              </p>
            </div>
            <div>
              <p className="text-indigo-800 dark:text-indigo-200">
                <strong>Growth:</strong> {stats.thisWeek > 0 ? 'Active this week!' : 'No recent activity'}
              </p>
            </div>
            <div>
              <p className="text-indigo-800 dark:text-indigo-200">
                <strong>Diversity:</strong> {stats.domains.length} different domains
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}