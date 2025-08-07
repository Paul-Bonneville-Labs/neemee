'use client';

import { useRouter } from 'next/navigation';
import { Clock, Globe, Copy, ExternalLink } from 'lucide-react';
import { Note } from '@/types';

interface NotesGridViewProps {
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

// Individual Note Card Component
function NoteCard({ note, onToast }: { note: Note; onToast: (type: 'success' | 'error', message: string, description?: string) => void }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/notes/${note.id}`)}
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        const rotateX = (mouseY / rect.height) * -8;
        const rotateY = (mouseX / rect.width) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      }}
      onMouseEnter={(e) => {
        const card = e.currentTarget;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.02)';
      }}
      className="card bg-base-300 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 ease-out transform-gpu"
    >
      {/* Card Body - Note preview content */}
      <div className="card-body pt-6 px-6 pb-4">
        {/* Page Title */}
        {note.page_title && (
          <div className="text-base-content/60 text-xs font-medium mb-1 whitespace-normal break-words">
            {note.page_title}
          </div>
        )}
        
        {/* Quote */}
        <p className="text-base-content text-sm leading-normal font-bold italic">
          &ldquo;{(() => {
            const text = note.snippet || note.content || 'No content';
            const maxLength = 200;
            
            if (text.length <= maxLength) return text;
            
            // Find the last space before the maxLength to avoid cutting words
            const truncated = text.substring(0, maxLength);
            const lastSpaceIndex = truncated.lastIndexOf(' ');
            
            // If no space found, use the original truncation (edge case)
            const finalText = lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated;
            
            return finalText + '...';
          })()}&rdquo;
        </p>
        
        <div className="text-left mt-1">
          <div className="tooltip tooltip-top tooltip-left tooltip-delayed z-50" data-tip={`${new Date(note.created_at).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}\n${new Date(note.created_at).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
          })}`}>
            <div className="inline-flex items-center gap-1 text-xs text-base-content/70 cursor-help">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(new Date(note.created_at))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer - Metadata */}
      <div className="card-footer px-4 py-2 bg-base-200 rounded-b-lg">
        <div className="space-y-2 text-xs text-base-content/70">
          
          {/* Domain Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="tooltip tooltip-top tooltip-delayed z-50 flex items-center gap-1" data-tip={note.page_url || 'Unknown source'}>
              <img 
                src={getFaviconUrl(note.page_url ? new URL(note.page_url).hostname : 'Unknown source')} 
                alt="" 
                className="w-3 h-3 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'inline';
                }}
              />
              <Globe className="w-3 h-3 flex-shrink-0 hidden" />
              <span className="truncate text-base-content/70">
                {note.page_url ? new URL(note.page_url).hostname : 'Unknown source'}
              </span>
            </div>
            
            {/* Action buttons */}
            {note.page_url && (
              <div className="flex items-center gap-0.5">
                {/* Copy Button */}
                <div className="tooltip tooltip-top tooltip-delayed z-50" data-tip="Copy URL">
                  <button 
                    className="btn btn-ghost btn-xs p-1 h-6 w-6 min-h-6 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (note.page_url) {
                        navigator.clipboard.writeText(note.page_url).then(() => {
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
                <div className="tooltip tooltip-top tooltip-delayed z-50" data-tip="Open in new tab">
                  <button 
                    className="btn btn-ghost btn-xs p-1 h-6 w-6 min-h-6 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (note.page_url) {
                        window.open(note.page_url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotesGridView({ notes, onToast }: NotesGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard 
          key={note.id} 
          note={note} 
          onToast={onToast} 
        />
      ))}
    </div>
  );
}