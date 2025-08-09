'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { Auth } from '@/components/Auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookmarkletLoginPage } from '@/components/BookmarkletLoginPage';
import { Edit3, Zap, Network } from 'lucide-react';
import appConfig from '../../config.json';

function LandingPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if this is a bookmarklet request (requires all capture parameters)
  const isBookmarkletRequest = useMemo(() => 
    mounted && 
    searchParams.has('text') && 
    searchParams.has('url') && 
    searchParams.has('key'),
    [mounted, searchParams]
  );

  // Redirect authenticated users to library
  useEffect(() => {
    if (user && mounted && !isBookmarkletRequest) {
      router.push('/library');
    }
  }, [user, mounted, isBookmarkletRequest, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show bookmarklet login page for unauthenticated bookmarklet requests
  if (!user && isBookmarkletRequest) {
    return <BookmarkletLoginPage />;
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="min-h-screen flex">
          {/* Left Side - App Info */}
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {/* Enhanced gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-indigo-600/10 dark:from-blue-400/5 dark:via-purple-400/3 dark:to-indigo-400/5"></div>
            
            {/* Floating orb animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-indigo-500/25 to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            {/* Content container */}
            <div className="relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {appConfig.app.name}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                {appConfig.app.description}
              </p>
              
              {/* Feature Cards */}
              <div className="space-y-6">
                {/* Capture Feature */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-500/20 dark:border-blue-400/20 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        Capture Anywhere
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Highlight text on any website with our intelligent bookmarklet
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                        One-Click
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Processing Feature */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-green-500/20 dark:border-green-400/20 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                        AI Extraction
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        AI automatically identifies entities, relationships, and key concepts
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                        GPT-4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Knowledge Graph Feature */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-500/20 dark:border-purple-400/20 rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                        Knowledge Graph
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Build your personal knowledge network and discover connections
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                        Neo4j
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Side - Login Form (Full Height) */}
          <div className="flex-1 flex flex-col justify-center p-8">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-md">
                <Auth onClose={() => {}} showClose={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This shouldn't happen since we redirect authenticated users, but just in case
  return null;
}

export default function LandingPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  );
}