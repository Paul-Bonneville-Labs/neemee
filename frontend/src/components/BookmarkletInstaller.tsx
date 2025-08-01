'use client';

import { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Check, 
  AlertCircle,
  Chrome,
  Globe,
  ArrowDown,
  MousePointer,
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
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTestResult, setShowTestResult] = useState<'success' | 'error' | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setUserAgent(navigator.userAgent);
  }, []);

  const getBrowserInfo = () => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) {
      return { name: 'Chrome', icon: Chrome, color: 'text-blue-600' };
    } else if (ua.includes('firefox')) {
      return { name: 'Firefox', icon: Globe, color: 'text-orange-600' };
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return { name: 'Safari', icon: Laptop, color: 'text-blue-500' };
    } else if (ua.includes('edg')) {
      return { name: 'Edge', icon: Monitor, color: 'text-blue-700' };
    } else {
      return { name: 'Browser', icon: Globe, color: 'text-gray-600' };
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

  const testBookmarklet = () => {
    // Simulate testing the bookmarklet
    setShowTestResult('success');
    setIsInstalled(true);
    setTimeout(() => setShowTestResult(null), 3000);
  };

  if (!isReady) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            API Key Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
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
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Bookmarklet Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to generate bookmarklet. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Browser Detection */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <BrowserIcon className={`h-5 w-5 ${browser.color}`} />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Detected Browser: {browser.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Instructions optimized for your browser
          </p>
        </div>
      </div>

      {/* Main Installation */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Install Bookmarklet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Follow these steps to install your bookmarklet
          </p>
          
          {/* Manual Installation Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Installation Steps
            </h4>
            <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside text-left max-w-md mx-auto">
              <li>Right-click on your bookmarks bar and select "Add bookmark" (or use Ctrl+Shift+D / Cmd+Shift+D)</li>
              <li>Set the name to: <strong>"Post to Neemee"</strong></li>
              <li>Copy the JavaScript code below and paste it as the URL</li>
              <li>Save the bookmark</li>
            </ol>
          </div>
          
          {/* Copy JavaScript Code */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Bookmarklet Code
              </span>
              <button
                onClick={() => copyToClipboard(bookmarklet.bookmarklet)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1 px-2 py-1 border border-blue-300 dark:border-blue-600 rounded"
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
              className="w-full h-24 text-xs font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 resize-none"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
        </div>

        {/* Alternative Installation Methods */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Alternative Installation
          </h4>
          
          <div className="space-y-3">
            {/* Copy Code Method */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Copy & Paste Method
                </span>
                <button
                  onClick={() => copyToClipboard(bookmarklet.bookmarklet)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
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
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Copy the bookmarklet code above</li>
                <li>Create a new bookmark in your browser</li>
                <li>Set the name to "Post to Neemee"</li>
                <li>Paste the code as the URL/location</li>
                <li>Save the bookmark</li>
              </ol>
            </div>

            {/* Mobile Installation */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Mobile Users
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Bookmarklets work best on desktop browsers. For mobile highlighting, consider using our browser extension when available.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Verification */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Test Your Installation
          </h4>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              After installing the bookmarklet, test it by:
            </p>
            
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside ml-4">
              <li>Select some text on any webpage</li>
              <li>Click the "Post to Neemee" bookmark</li>
              <li>Look for a success notification</li>
            </ol>

            {/* Test Button */}
            <button
              onClick={testBookmarklet}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span className="font-medium">Mark as Installed</span>
            </button>

            {/* Test Result */}
            {showTestResult && (
              <div className={`p-3 rounded-lg border ${
                showTestResult === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {showTestResult === 'success' ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    showTestResult === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {browser.name} Tips
          </h4>
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            {browser.name === 'Chrome' && (
              <>
                <p>• Make sure your bookmarks bar is visible (Ctrl+Shift+B)</p>
                <p>• Drag the button directly to the bookmarks bar</p>
                <p>• You can also right-click and "Bookmark this link"</p>
              </>
            )}
            {browser.name === 'Firefox' && (
              <>
                <p>• Show bookmarks toolbar (Ctrl+Shift+B)</p>
                <p>• Drag the button to the bookmarks toolbar</p>
                <p>• Or use Bookmarks → Add Bookmark</p>
              </>
            )}
            {browser.name === 'Safari' && (
              <>
                <p>• Show favorites bar (View → Show Favorites Bar)</p>
                <p>• Drag the button to the favorites bar</p>
                <p>• Make sure Safari allows JavaScript bookmarklets</p>
              </>
            )}
            {browser.name === 'Browser' && (
              <>
                <p>• Look for a bookmarks or favorites bar in your browser</p>
                <p>• Drag the button there, or copy the code manually</p>
                <p>• Enable JavaScript if bookmarklets don't work</p>
              </>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.open('https://support.google.com/chrome/answer/188842', '_blank')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Chrome Help
          </button>
          <button
            onClick={() => window.open('https://support.mozilla.org/en-US/kb/bookmarks-toolbar-display-favorite-websites', '_blank')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Firefox Help
          </button>
          <button
            onClick={() => window.open('https://support.apple.com/guide/safari/bookmarks-sfri40522/mac', '_blank')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Safari Help
          </button>
        </div>
      </div>
    </div>
  );
}