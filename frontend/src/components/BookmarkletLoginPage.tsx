'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Auth } from '@/components/Auth';
import { Bookmark, ArrowRight, AlertCircle } from 'lucide-react';
import appConfig from '../../config.json';

const PREVIEW_TEXT_MAX_LENGTH = 150;
const MAX_TEXT_LENGTH = 10000; // Match bookmarklet limit
const MAX_TITLE_LENGTH = 500;

interface CaptureData {
  text?: string;
  url?: string;
  title?: string;
  apiKey?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Input validation utilities
function isValidUrl(urlString: string | null): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeText(text: string | null, maxLength: number): string | undefined {
  if (!text) return undefined;
  return text.substring(0, maxLength).trim();
}

function validateCaptureData(text: string | null, url: string | null, apiKey: string | null): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!text || text.trim().length === 0) {
    errors.push({ field: 'text', message: 'No text selected to capture' });
  } else if (text.length > MAX_TEXT_LENGTH) {
    errors.push({ field: 'text', message: `Text is too long (max ${MAX_TEXT_LENGTH} characters)` });
  }
  
  if (!url || !isValidUrl(url)) {
    errors.push({ field: 'url', message: 'Invalid or missing source URL' });
  }
  
  if (!apiKey || apiKey.trim().length === 0) {
    errors.push({ field: 'apiKey', message: 'Missing API key' });
  }
  
  return errors;
}

export function BookmarkletLoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [captureData, setCaptureData] = useState<CaptureData>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  
  // Extract and validate capture data from URL parameters with memoization
  const rawParams = useMemo(() => ({
    text: searchParams.get('text'),
    url: searchParams.get('url'), 
    title: searchParams.get('title'),
    apiKey: searchParams.get('key'),
  }), [searchParams]);

  // Extract capture data from URL parameters with validation
  useEffect(() => {
    const { text, url, title, apiKey } = rawParams;
    
    // Validate the raw parameters
    const errors = validateCaptureData(text, url, apiKey);
    setValidationErrors(errors);
    
    // If validation passes, sanitize and set the data
    if (errors.length === 0) {
      setCaptureData({
        text: sanitizeText(text, MAX_TEXT_LENGTH),
        url: url || undefined,
        title: sanitizeText(title, MAX_TITLE_LENGTH),
        apiKey: apiKey || undefined,
      });
    } else {
      setCaptureData({});
    }
  }, [rawParams]);

  // Redirect to capture page once authenticated
  useEffect(() => {
    if (user && captureData.text && captureData.url && captureData.apiKey && validationErrors.length === 0) {
      try {
        // Reconstruct the capture URL with all parameters
        const params = new URLSearchParams();
        if (captureData.text) params.set('text', captureData.text);
        if (captureData.url) params.set('url', captureData.url);
        if (captureData.title) params.set('title', captureData.title);
        if (captureData.apiKey) params.set('key', captureData.apiKey);
        
        router.push(`/capture?${params.toString()}`);
      } catch (error) {
        console.error('Failed to redirect to capture page:', error);
        setRedirectError('Failed to redirect to capture page. Please try again.');
      }
    }
  }, [user, captureData, validationErrors, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const previewText = captureData.text ? 
    (captureData.text.length > PREVIEW_TEXT_MAX_LENGTH ? captureData.text.substring(0, PREVIEW_TEXT_MAX_LENGTH) + '...' : captureData.text) 
    : null;

  // Show error page if validation fails
  if (validationErrors.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Invalid Bookmarklet Request
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                There was a problem with your highlight capture request
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-red-200/50 dark:border-red-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-3">
                Issues Found:
              </h3>
              <ul className="space-y-2" role="list" aria-label="Validation errors">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please try selecting text on a webpage and using your bookmarklet again.
              </p>
              <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center" 
                 role="img" aria-label="Neemee bookmark icon">
              <Bookmark className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" id="main-heading">
              Sign in to {appConfig.app.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your highlight capture
            </p>
          </div>

          {/* Redirect Error */}
          {redirectError && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {redirectError}
                </p>
              </div>
            </div>
          )}

          {/* Preview of what will be captured */}
          {previewText && (
            <div className="mb-6 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg"
                 role="region" aria-labelledby="capture-preview-heading" aria-describedby="capture-preview-text">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" role="presentation" aria-hidden="true"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1" id="capture-preview-heading">
                    Ready to capture:
                  </p>
                  <blockquote className="text-sm text-gray-600 dark:text-gray-300 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3"
                              id="capture-preview-text" cite={captureData.url}>
                    &ldquo;{previewText}&rdquo;
                  </blockquote>
                  {captureData.title && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2" aria-label={`Source page: ${captureData.title}`}>
                      From: {captureData.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="mb-6">
            <Auth onClose={() => {}} showClose={false} />
          </div>

          {/* Instructions */}
          <div className="text-center space-y-3" role="region" aria-labelledby="main-heading">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400" 
                 role="list" aria-label="Steps to complete capture">
              <span role="listitem">Sign in</span>
              <ArrowRight className="h-4 w-4" role="presentation" aria-hidden="true" />
              <span role="listitem">Capture highlight</span>
              <ArrowRight className="h-4 w-4" role="presentation" aria-hidden="true" />
              <span role="listitem">Done</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400" role="note">
              Your highlight will be saved automatically after signing in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}