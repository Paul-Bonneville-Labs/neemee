'use client';

import { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Check, 
  AlertCircle,
  Chrome,
  Globe,
  Copy,
  ExternalLink,
  Monitor,
  Laptop
} from 'lucide-react';
import { BookmarkletResponse } from '@/types';

interface BookmarkletInstallerProps {
  bookmarklet: BookmarkletResponse | null;
  isReady: boolean;
  className?: string;
}

export function BookmarkletInstaller({ bookmarklet, isReady, className = '' }: BookmarkletInstallerProps) {
  const [userAgent, setUserAgent] = useState('');
  const [showTestResult] = useState<'success' | 'error' | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setUserAgent(navigator.userAgent);
  }, []);

  const getBrowserInfo = () => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) {
      return { name: 'Chrome', icon: Chrome, color: 'text-info' };
    } else if (ua.includes('firefox')) {
      return { name: 'Firefox', icon: Globe, color: 'text-warning' };
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return { name: 'Safari', icon: Laptop, color: 'text-primary' };
    } else if (ua.includes('edg')) {
      return { name: 'Edge', icon: Monitor, color: 'text-secondary' };
    } else {
      return { name: 'Browser', icon: Globe, color: 'text-neutral' };
    }
  };

  const browser = getBrowserInfo();
  const BrowserIcon = browser.icon;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };


  if (!isReady) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">
            API Key Required
          </h3>
          <p className="text-base-content/70">
            Please generate an API key first to create your personalized bookmarklet.
          </p>
        </div>
      </div>
    );
  }

  if (!bookmarklet) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">
            Bookmarklet Error
          </h3>
          <p className="text-base-content/70">
            Failed to generate bookmarklet. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Browser Detection */}
      <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
        <BrowserIcon className={`h-5 w-5 ${browser.color}`} />
        <div>
          <p className="text-sm font-medium text-base-content">
            Detected Browser: {browser.name}
          </p>
          <p className="text-xs text-base-content/70">
            Instructions optimized for your browser
          </p>
        </div>
      </div>

      {/* Main Installation */}
      <div className="space-y-4">
        <div className="text-center">
          
          {/* Manual Installation Steps */}
          <div role="alert" className="alert alert-soft mb-4">
            <Bookmark className="h-5 w-5 shrink-0 self-start" />
            <div>
              <h4 className="text-sm font-semibold mb-3">Installation Steps</h4>
              <ol className="text-xs space-y-2 list-decimal list-inside text-left max-w-md mx-auto">
                <li>Right-click on your bookmarks bar and select &ldquo;Add bookmark&rdquo; (or use Ctrl+Shift+D / Cmd+Shift+D)</li>
                <li>Set the name to: <strong>&ldquo;Post to Neemee&rdquo;</strong></li>
                <li>Copy the JavaScript code below and paste it as the URL</li>
                <li>Save the bookmark</li>
              </ol>
            </div>
          </div>
          
          {/* Copy JavaScript Code */}
          <div className="bg-base-300 border border-base-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-base-content">
                Bookmarklet Code
              </span>
              <button
                onClick={() => copyToClipboard(bookmarklet.bookmarklet)}
                className="text-xs text-primary hover:text-primary-focus flex items-center gap-1 px-2 py-1 border border-primary/30 rounded"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <textarea
              value={bookmarklet.bookmarklet}
              readOnly
              className="w-full h-24 text-xs font-mono bg-base-100 border border-base-300 rounded p-2 resize-none text-base-content"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
        </div>


        {/* Installation Verification */}
        <div className="border-t border-base-300 pt-4">
          <h4 className="text-sm font-semibold text-base-content mb-3">
            Test Your Installation
          </h4>
          
          <div className="space-y-3">
            <p className="text-sm text-base-content/70">
              After installing the bookmarklet, test it by:
            </p>
            
            <ol className="text-sm text-base-content/70 space-y-2 list-decimal list-inside ml-4">
              <li>Select some text on any webpage</li>
              <li>Click the &ldquo;Post to Neemee&rdquo; bookmark</li>
              <li>Look for a success notification</li>
            </ol>


            {/* Test Result */}
            {showTestResult && (
              <div className={`p-3 rounded-lg border ${
                showTestResult === 'success' 
                  ? 'bg-success/10 border-success/20'
                  : 'bg-error/10 border-error/20'
              }`}>
                <div className="flex items-center gap-2">
                  {showTestResult === 'success' ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-error" />
                  )}
                  <span className={`text-sm font-medium ${
                    showTestResult === 'success'
                      ? 'text-success'
                      : 'text-error'
                  }`}>
                    {showTestResult === 'success' 
                      ? 'Great! Your bookmarklet is ready to use.'
                      : 'Test failed. Please check your installation.'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Browser-Specific Instructions */}
        <div role="alert" className="alert alert-soft">
          <BrowserIcon className="h-5 w-5 shrink-0 self-start" />
          <div>
            <h4 className="text-sm font-semibold mb-2">
              {browser.name} Tips
            </h4>
            <div className="text-xs space-y-1">
            {browser.name === 'Chrome' && (
              <>
                <p>• Make sure your bookmarks bar is visible (Ctrl+Shift+B)</p>
                <p>• Right-click on bookmarks bar and select "Add page"</p>
                <p>• Copy the code above and paste it as the URL</p>
              </>
            )}
            {browser.name === 'Firefox' && (
              <>
                <p>• Show bookmarks toolbar (Ctrl+Shift+B)</p>
                <p>• Use Bookmarks → Add Bookmark (Ctrl+D)</p>
                <p>• Copy the code above and paste it as the location</p>
              </>
            )}
            {browser.name === 'Safari' && (
              <>
                <p>• Show favorites bar (View → Show Favorites Bar)</p>
                <p>• Use Bookmarks → Add Bookmark (Cmd+D)</p>
                <p>• Copy the code above and paste it as the URL</p>
              </>
            )}
            {browser.name === 'Browser' && (
              <>
                <p>• Look for a bookmarks or favorites bar in your browser</p>
                <p>• Add a new bookmark and paste the code as the URL</p>
                <p>• Enable JavaScript if bookmarklets don&apos;t work</p>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.open('https://support.google.com/chrome/answer/188842', '_blank')}
            className="text-xs text-primary hover:text-primary-focus flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Chrome Help
          </button>
          <button
            onClick={() => window.open('https://support.mozilla.org/en-US/kb/bookmarks-toolbar-display-favorite-websites', '_blank')}
            className="text-xs text-primary hover:text-primary-focus flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Firefox Help
          </button>
          <button
            onClick={() => window.open('https://support.apple.com/guide/safari/bookmarks-sfri40522/mac', '_blank')}
            className="text-xs text-primary hover:text-primary-focus flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Safari Help
          </button>
        </div>
      </div>
    </div>
  );
}