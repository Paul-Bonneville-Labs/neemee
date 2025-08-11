'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Globe, Copy, ExternalLink } from 'lucide-react';
import { Note } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        {/* Note Title */}
        {note.noteTitle && (
          <div className="text-base-content/60 text-xs font-medium mb-1 whitespace-normal break-words">
            {note.noteTitle}
          </div>
        )}
        
        {/* Markdown Content */}
        <div className="text-base-content text-sm leading-normal prose prose-sm max-w-none prose-p:my-1 prose-headings:text-base-content prose-headings:my-1 prose-blockquote:my-1 prose-blockquote:border-l-base-content/30 prose-blockquote:font-medium prose-blockquote:italic prose-blockquote:text-base-content/80 prose-a:text-primary prose-code:text-base-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Customize rendering for better card display
              p: ({ children }) => <p className="my-1">{children}</p>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-base-content/30 pl-2 my-1 italic font-medium text-base-content/80">{children}</blockquote>,
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  className="text-primary hover:text-primary/80 underline"
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => <code className="bg-base-200 px-1 py-0.5 rounded text-xs">{children}</code>,
              h1: ({ children }) => <h1 className="text-base font-semibold my-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-medium my-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-medium my-1">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside my-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside my-1">{children}</ol>,
              li: ({ children }) => <li className="my-0">{children}</li>
            }}
          >
            {(() => {
              const text = note.content || 'No content';
              const maxLength = 200;
              
              if (text.length <= maxLength) return text;
              
              // Find the last space before the maxLength to avoid cutting words
              const truncated = text.substring(0, maxLength);
              const lastSpaceIndex = truncated.lastIndexOf(' ');
              
              // If no space found, use the original truncation (edge case)
              const finalText = lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated;
              
              return finalText + '...';
            })()}
          </ReactMarkdown>
        </div>
        
        <div className="text-left mt-1">
          <div className="tooltip tooltip-top tooltip-left tooltip-delayed z-50" data-tip={`${new Date(note.createdAt).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}\n${new Date(note.createdAt).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
          })}`}>
            <div className="inline-flex items-center gap-1 text-xs text-base-content/70 cursor-help">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(new Date(note.createdAt))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer - Metadata (only if pageUrl exists) */}
      {note.pageUrl && (
        <div className="card-footer px-4 py-2 bg-base-200 rounded-b-lg">
          <div className="space-y-2 text-xs text-base-content/70">
            {/* Domain Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="tooltip tooltip-top tooltip-delayed z-50 flex items-center gap-1" data-tip={note.pageUrl || 'Unknown source'}>
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
                <span className="truncate text-base-content/70">
                  {note.pageUrl ? new URL(note.pageUrl).hostname : 'Unknown source'}
                </span>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-0.5">
                {/* Copy Button */}
                <div className="tooltip tooltip-top tooltip-delayed z-50" data-tip="Copy URL">
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
                <div className="tooltip tooltip-top tooltip-delayed z-50" data-tip="Open in new tab">
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
          </div>
        </div>
      )}
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