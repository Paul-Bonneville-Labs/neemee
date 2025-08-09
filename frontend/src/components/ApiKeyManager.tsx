'use client';

import { useState } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  RefreshCw, 
  Plus,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity
} from 'lucide-react';
import { UserApiKey, ApiResponse } from '@/types';
import { formatDetailedDate } from '@/lib/dateUtils';

interface ApiKeyManagerProps {
  apiKey: UserApiKey | null;
  onUpdate: (apiKey: UserApiKey) => void;
  className?: string;
}

export function ApiKeyManager({ apiKey, onUpdate, className = '' }: ApiKeyManagerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

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

  const generateApiKey = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/user/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      const result: ApiResponse<UserApiKey> = await response.json();

      if (result.success && result.data) {
        // When creating a new API key, preserve the fullKey for bookmarklet generation
        const apiKeyData = result.data as UserApiKey & { fullKey?: string };
        const updatedApiKey: UserApiKey = {
          ...apiKeyData,
          api_key: apiKeyData.fullKey || apiKeyData.api_key, // Use fullKey as the displayed key
          fullKey: apiKeyData.fullKey // Store fullKey for bookmarklet use
        };
        onUpdate(updatedApiKey);
      } else {
        setError(result.error || 'Failed to generate API key');
      }
    } catch (err) {
      console.error('Error generating API key:', err);
      setError('Network error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateApiKey = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      setShowConfirmDialog(false);

      const response = await fetch('/api/user/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ regenerate: true }),
      });

      const result: ApiResponse<UserApiKey> = await response.json();

      if (result.success && result.data) {
        // When regenerating, preserve the fullKey for bookmarklet generation
        const apiKeyData = result.data as UserApiKey & { fullKey?: string };
        const updatedApiKey: UserApiKey = {
          ...apiKeyData,
          api_key: apiKeyData.fullKey || apiKeyData.api_key, // Use fullKey as the displayed key
          fullKey: apiKeyData.fullKey // Store fullKey for bookmarklet use
        };
        onUpdate(updatedApiKey);
        setIsVisible(true); // Show the new key
      } else {
        setError(result.error || 'Failed to regenerate API key');
      }
    } catch (err) {
      console.error('Error regenerating API key:', err);
      setError('Network error occurred');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Use imported utility function for consistent date formatting

  // If no API key exists, show generation interface
  if (!apiKey) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No API Key Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate an API key to start using the bookmarklet feature. Your key will be used to authenticate highlight captures.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={generateApiKey}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Generate API Key
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* API Key Display */}
      <div className="bg-base-300 rounded-lg p-4 border border-base-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-base-content/60" />
            <span className="text-sm font-medium text-base-content">
              Your API Key
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-xs text-success font-medium">
              Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-base-100 border border-base-300 rounded-md px-3 py-2">
            <code className="text-sm font-mono text-base-content">
              {isVisible ? apiKey.api_key : maskApiKey(apiKey.api_key)}
            </code>
          </div>
          
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-md transition-colors"
            title={isVisible ? 'Hide API key' : 'Show API key'}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => copyToClipboard(apiKey.api_key)}
            className="p-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copySuccess ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Copy Success Message */}
        {copySuccess && (
          <div className="text-xs text-success mb-3">
            API key copied to clipboard!
          </div>
        )}

        {/* Key Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-base-content/70">
            <Calendar className="h-3 w-3" />
            <span>Created: {formatDetailedDate(apiKey.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/70">
            <Activity className="h-3 w-3" />
            <span>Last used: Recently</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isRegenerating}
          className="btn btn-error"
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate Key
            </>
          )}
        </button>

        <button
          onClick={() => copyToClipboard(apiKey.api_key)}
          className="btn btn-primary"
        >
          <Copy className="h-4 w-4" />
          Copy Key
        </button>
      </div>

      {/* Regeneration Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Regenerate API Key?
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will create a new API key and invalidate the current one. You&apos;ll need to update your bookmarklet with the new key.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={regenerateApiKey}
                  disabled={isRegenerating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isRegenerating ? 'Regenerating...' : 'Yes, Regenerate'}
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isRegenerating}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div role="alert" className="alert alert-soft">
        <AlertTriangle className="h-5 w-5 shrink-0 self-start" />
        <div>
          <h4 className="text-sm font-semibold mb-2">
            Security Notice
          </h4>
          <p className="text-xs">
            Keep your API key secure and never share it publicly. The key provides access to your Neemee account for highlight capture.
          </p>
        </div>
      </div>
    </div>
  );
}