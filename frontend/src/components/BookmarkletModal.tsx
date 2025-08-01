'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckIcon, BookmarkIcon, AlertCircleIcon } from 'lucide-react';
import { BookmarkletResponse, ApiResponse } from '@/types';

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookmarkletModal({ isOpen, onClose }: BookmarkletModalProps) {
  const [bookmarkletData, setBookmarkletData] = useState<BookmarkletResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !bookmarkletData) {
      fetchBookmarklet();
    }
  }, [isOpen, bookmarkletData]);

  const fetchBookmarklet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bookmarklet', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookmarklet: ${response.status}`);
      }

      const data: ApiResponse<BookmarkletResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to load bookmarklet');
      }

      setBookmarkletData(data.data);
    } catch (err) {
      console.error('Error fetching bookmarklet:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookmarklet');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BookmarkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Highlight Bookmarklet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading bookmarklet...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchBookmarklet}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : bookmarkletData ? (
            <>
              {/* Instructions */}
              <div className="prose dark:prose-invert max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: bookmarkletData.instructions }}
                  className="text-sm text-gray-700 dark:text-gray-300 space-y-4"
                />
              </div>

              {/* Bookmarklet Code */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Bookmarklet Code
                  </h3>
                  <button
                    onClick={() => copyToClipboard(bookmarkletData.bookmarklet)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 
                             hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                
                <div className="relative">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto 
                                 border border-gray-200 dark:border-gray-700">
                    <code className="text-gray-800 dark:text-gray-200">
                      {bookmarkletData.bookmarklet}
                    </code>
                  </pre>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BookmarkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Quick Setup
                      </p>
                      <ol className="text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                        <li>Copy the bookmarklet code above</li>
                        <li>Create a new bookmark in your browser</li>
                        <li>Paste the code as the bookmark URL</li>
                        <li>Name it "Capture Highlight" or similar</li>
                        <li>Visit any webpage and click the bookmark after selecting text</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Tips */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Usage Tips
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                  <li>Select any text on a webpage before clicking the bookmarklet</li>
                  <li>The highlight will be automatically saved to your collection</li>
                  <li>Works on most websites - some may block bookmarklets for security</li>
                  <li>Make sure you're logged in to save highlights successfully</li>
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 
                     transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}