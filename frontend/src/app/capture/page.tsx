'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export default function CapturePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'timeout'>('loading');
  const [message, setMessage] = useState('Processing note...');
  const [noteData, setNoteData] = useState<{
    text: string;
    url: string;
    title: string;
  } | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [, setProcessingStage] = useState<'saving' | 'complete'>('saving');

  useEffect(() => {
    const captureNote = async () => {
      try {
        // Get data from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const text = urlParams.get('text');
        const url = urlParams.get('url');
        const title = urlParams.get('title');

        if (!text || !url) {
          setStatus('error');
          setMessage('Missing required data. Please try the bookmarklet again.');
          return;
        }

        // Store the note data for display
        setNoteData({ 
          text, 
          url, 
          title: title || 'Untitled Page'
        });

        // Update progress
        setProcessingStage('saving');
        setMessage('Saving note...');

        // Create timeout controller for the entire operation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          setStatus('timeout');
          setMessage('Processing took longer than expected. Check your dashboard for results.');
        }, 30000); // 30 second timeout

        try {
          // Save the note via API with session authentication
          const response = await fetch('/api/notes/capture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Use session authentication
            body: JSON.stringify({
              content: text,
              snippet: text,
              page_url: url,
              page_title: title,
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          const result = await response.json();

          if (result.success) {
            setStatus('success');
            setProcessingStage('complete');
            setMessage(result.message || 'Highlight saved successfully!');
            
            // Store the note ID for direct navigation
            if (result.noteId) {
              setNoteId(result.noteId);
            }
          } else {
            setStatus('error');
            setMessage(result.message || 'Failed to save note');
          }
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error instanceof Error && error.name === 'AbortError') {
            // Timeout occurred
            setStatus('timeout');
            setMessage('Processing took longer than expected. Check your dashboard for results.');
          } else {
            throw error; // Re-throw other errors
          }
        }

      } catch (error) {
        console.error('Error saving note:', error);
        setStatus('error');
        setMessage('An error occurred while saving the note');
      }
    };

    captureNote();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />;
      case 'success':
        return <Check className="h-8 w-8 text-green-600" />;
      case 'timeout':
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'timeout':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Neemee Highlight Capture
          </h1>
          <p className={`text-sm ${getStatusColor()}`}>
            {message}
          </p>
        </div>

        {noteData && (
          <div className="space-y-4">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Captured Highlight
              </h3>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 rounded-r mb-4">
                <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                  &ldquo;{noteData.text}&rdquo;
                </p>
              </div>
              
              <div className="space-y-3">
                {/* Page Title Section */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Page Title
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {noteData.title}
                  </p>
                </div>
                
                {/* URL Section */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Source URL
                  </h4>
                  <a 
                    href={noteData.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title={noteData.url}
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-sm max-w-full"
                  >
                    <span className="truncate max-w-[280px] inline-block">
                      {noteData.url}
                    </span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
                
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {(status === 'success' || status === 'timeout') && (
            <button
              onClick={() => window.close()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          )}
          
          <button
            onClick={() => {
              if (noteId) {
                // Navigate directly to the specific note
                window.open(`/notes/${noteId}`, '_blank');
              } else {
                // Fallback to general library
                window.open('/library', '_blank');
              }
              // Close the capture page after opening the highlight
              window.close();
            }}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {status === 'timeout' 
              ? 'Check Library' 
              : noteId 
              ? 'View Highlight' 
              : 'View Library'}
          </button>
        </div>
      </div>
    </div>
  );
}