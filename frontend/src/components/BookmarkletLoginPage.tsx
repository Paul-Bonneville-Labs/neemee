'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Auth } from '@/components/Auth';
import { Bookmark, ArrowRight } from 'lucide-react';
import appConfig from '../../config.json';

interface BookmarkletLoginPageProps {
  text?: string;
  url?: string;
  title?: string;
  apiKey?: string;
}

export function BookmarkletLoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [captureData, setCaptureData] = useState<BookmarkletLoginPageProps>({});
  
  // Extract capture data from URL parameters
  useEffect(() => {
    setCaptureData({
      text: searchParams.get('text') || undefined,
      url: searchParams.get('url') || undefined,
      title: searchParams.get('title') || undefined,
      apiKey: searchParams.get('key') || undefined,
    });
  }, [searchParams]);

  // Redirect to capture page once authenticated
  useEffect(() => {
    if (user && captureData.text && captureData.url && captureData.apiKey) {
      // Reconstruct the capture URL with all parameters
      const params = new URLSearchParams();
      if (captureData.text) params.set('text', captureData.text);
      if (captureData.url) params.set('url', captureData.url);
      if (captureData.title) params.set('title', captureData.title);
      if (captureData.apiKey) params.set('key', captureData.apiKey);
      
      router.push(`/capture?${params.toString()}`);
    }
  }, [user, captureData, router]);

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
    (captureData.text.length > 150 ? captureData.text.substring(0, 150) + '...' : captureData.text) 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bookmark className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to {appConfig.app.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your highlight capture
            </p>
          </div>

          {/* Preview of what will be captured */}
          {previewText && (
            <div className="mb-6 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Ready to capture:
                  </p>
                  <blockquote className="text-sm text-gray-600 dark:text-gray-300 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                    &ldquo;{previewText}&rdquo;
                  </blockquote>
                  {captureData.title && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
              <span>Capture highlight</span>
              <ArrowRight className="h-4 w-4" />
              <span>Done</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your highlight will be saved automatically after signing in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}