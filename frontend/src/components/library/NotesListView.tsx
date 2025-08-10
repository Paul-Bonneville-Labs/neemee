'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Globe, Copy, ExternalLink } from 'lucide-react';
import { Note } from '@/types';

interface NotesListViewProps {
  notes: Note[];
  onToast: (type: 'success' | 'error', message: string, description?: string) => void;
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

export function NotesListView({ notes, onToast }: NotesListViewProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm table-zebra">
        <thead>
          <tr>
            <th className="w-16">Time</th>
            <th>Content</th>
            <th className="w-56">Link</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr 
              key={note.id}
              className="hover:bg-base-200 cursor-pointer"
              onClick={() => router.push(`/notes/${note.id}`)}
            >
              {/* Time Column */}
              <td className="text-sm whitespace-nowrap align-top">
              <div 
                  className="tooltip tooltip-right tooltip-delayed"
                  data-tip={`${new Date(note.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}\n${new Date(note.createdAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}`}
                >
                  <time className="text-base-content/70 text-xs">
                    {formatRelativeTime(new Date(note.createdAt))}
                  </time>
                </div>
              </td>

              {/* Content Column */}
              <td className="max-w-0 w-full align-top">
                <div className="space-y-1">
                  {/* Note Title */}
                  {note.noteTitle && (
                    <div className="text-sm font-bold text-base-content whitespace-normal break-words">
                      {note.noteTitle}
                    </div>
                  )}
                  <div className="line-clamp-2">
                    <span className="italic text-base-content/80 text-sm">
                      &ldquo;{note.snippet || note.content || 'No content'}&rdquo;
                    </span>
                  </div>
                </div>
              </td>

              {/* Source Column (Domain Only) */}
              <td className="w-56 align-top">
                {note.pageUrl && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="tooltip tooltip-left tooltip-delayed flex items-center gap-1" data-tip={note.pageUrl || 'Unknown source'}>
                      <Image 
                        src={getFaviconUrl(note.pageUrl ? new URL(note.pageUrl).hostname : 'Unknown source')} 
                        alt={`Favicon for ${note.pageUrl ? new URL(note.pageUrl).hostname : 'Unknown source'}`} 
                        width={12}
                        height={12}
                        className="w-3 h-3 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = 'inline';
                        }}
                      />
                      <Globe className="w-3 h-3 flex-shrink-0 hidden" />
                      <span className="truncate text-base-content/70 text-xs">
                        {note.pageUrl ? new URL(note.pageUrl).hostname : 'Unknown source'}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5">
                      {/* Copy Button */}
                      <div className="tooltip tooltip-top tooltip-delayed" data-tip="Copy URL">
                        <button 
                          className="btn btn-ghost btn-xs p-1 h-6 w-6 min-h-6 opacity-60 hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (note.pageUrl) {
                              navigator.clipboard.writeText(note.pageUrl).then(() => {
                                onToast('success', 'URL copied to clipboard');
                              }).catch(err => {
                                console.error('Failed to copy URL:', err);
                                onToast('error', 'Failed to copy URL', 'Please try again');
                              });
                            }
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* External Link Button */}
                      <div className="tooltip tooltip-top tooltip-delayed" data-tip="Open in new tab">
                        <button 
                          className="btn btn-ghost btn-xs p-1 h-6 w-6 min-h-6 opacity-60 hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (note.pageUrl) {
                              window.open(note.pageUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}