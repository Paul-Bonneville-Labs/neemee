'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { FileList } from '@/components/FileList';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { CreateFileModal } from '@/components/CreateFileModal';
import { ToastContainer, useToasts } from '@/components/Toast';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import { FileInfo, MarkdownFile, FrontmatterData, ApiResponse } from '@/types';
import { LogOut, Settings, RefreshCw } from 'lucide-react';
import appConfig from '../../../config.json';

function DashboardContent() {
  const { data: session } = useSession();
  const { toasts, dismissToast } = useToasts();
  const [mounted, setMounted] = useState(false);
  
  // State management
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<MarkdownFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false); // Guard to prevent multiple loads
  const [repoInfo, setRepoInfo] = useState<{owner: string, repo: string, url: string} | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Load saved sidebar width from localStorage with enhanced validation
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth && /^\d+$/.test(savedWidth.trim())) {
      const width = parseInt(savedWidth, 10);
      if (!isNaN(width) && width >= 240 && width <= 600) { // Validate range and NaN
        setSidebarWidth(width);
      }
    }
  }, []);

  const loadFiles = useCallback(async () => {
    if (hasLoaded) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/files/list', {
        credentials: 'include',
      });
      const result: ApiResponse<FileInfo[]> = await response.json();
      
      if (result.success && result.data) {
        setFiles(result.data);
        setHasLoaded(true);
      } else {
        console.error('Failed to load files:', result.error);
      }
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasLoaded]);

  // Redirect if not authenticated - TEMPORARILY DISABLED FOR TESTING
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/');
  //   }
  // }, [status, router]);

  // Load repository info
  useEffect(() => {
    const loadRepoInfo = async () => {
      try {
        const response = await fetch('/api/repo');
        const result = await response.json();
        if (result.success && result.data) {
          setRepoInfo(result.data);
        }
      } catch (error) {
        console.error('Failed to load repo info:', error);
      }
    };
    
    loadRepoInfo();
  }, []);

  // Load files on mount - but only once
  useEffect(() => {
    loadFiles();
  }, [loadFiles]); // Include loadFiles dependency

  const loadFile = useCallback(async (filename: string) => {
    try {
      setIsEditorLoading(true);
      
      const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        credentials: 'include',
      });
      
      const result: ApiResponse<MarkdownFile> = await response.json();
      
      // Validate that the response matches the requested file (prevent race conditions)
      if (result.success && result.data && result.data.filename === filename) {
        setCurrentFile(result.data);
      } else if (result.success && result.data && result.data.filename !== filename) {
        // Don't update state with stale response
        console.warn('Discarding stale file response:', result.data.filename, 'expected:', filename);
        return;
      } else {
        console.error('API error:', result.error);
        setCurrentFile(null);
      }
    } catch (err) {
      console.error('Error loading file:', err);
      setCurrentFile(null);
    } finally {
      setIsEditorLoading(false);
    }
  }, []);

  const handleFileSelect = (filename: string) => {
    // Clear current file first to show loading state
    setCurrentFile(null);
    setSelectedFile(filename);
    loadFile(filename);
  };

  const handleNewFile = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateFile = (filename: string) => {
    // Create a new file object for editing
    const newFile: MarkdownFile = {
      filename,
      path: filename,
      content: `# ${filename.replace('.md', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\nStart writing your content here...\n`,
      frontmatter: {
        title: filename.replace('.md', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        author: session?.user?.username || session?.user?.name || 'Test User',
        status: 'draft',
        tags: [],
      },
      sha: '', // Empty for new files
      lastModified: '', // Will be set by server
    };
    
    setCurrentFile(newFile);
    setSelectedFile(filename);
  };

  const handleSaveFile = async (content: string, frontmatter: FrontmatterData) => {
    if (!currentFile) return;

    try {
      const isNewFile = !currentFile.sha;
      const url = isNewFile ? '/api/files/create' : `/api/files/${encodeURIComponent(currentFile.filename)}`;
      const method = isNewFile ? 'POST' : 'PUT';
      
      const body = isNewFile 
        ? { filename: currentFile.filename, content, frontmatter }
        : { content, frontmatter, sha: currentFile.sha };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Refresh file list and clear editor
        setHasLoaded(false); // Reset to allow reload
        await loadFiles();
        setCurrentFile(null);
        setSelectedFile(null);
      } else {
        console.error('Failed to save file:', result.error);
      }
    } catch (err) {
      console.error('Error saving file:', err);
    }
  };

  const handleCancelEdit = () => {
    setCurrentFile(null);
    setSelectedFile(null);
  };

  // Sidebar resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    // Throttle the resize for better performance
    const now = Date.now();
    const lastCall = (handleMouseMove as unknown as { lastCall?: number }).lastCall || 0;
    if (now - lastCall < 16) return; // ~60fps
    (handleMouseMove as unknown as { lastCall: number }).lastCall = now;
    
    // Calculate relative width instead of using absolute e.clientX
    const sidebar = document.querySelector('[data-sidebar]') as HTMLElement;
    if (!sidebar) return;
    
    const sidebarRect = sidebar.getBoundingClientRect();
    const newWidth = e.clientX - sidebarRect.left;
    const minWidth = 240; // Minimum sidebar width
    const maxWidth = Math.min(600, window.innerWidth * 0.4); // Max 40% of window width or 600px
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      localStorage.setItem('sidebar-width', newWidth.toString());
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // TEMPORARY: Skip loading and session checks for testing
  // if (status === 'loading') {
  //   return (
  //     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
  //         <p className="text-gray-600 dark:text-gray-400">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!session) {
  //   return null; // Will redirect via useEffect
  // }

  // Prevent hydration mismatch - show loading until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {appConfig.app.displayName}
            </h1>
            
            {/* Repository Selector */}
            <div className="flex items-center gap-2">
              <select 
                disabled
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                         bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                         rounded-md cursor-not-allowed opacity-75
                         min-w-80 w-96"
                value={repoInfo?.url || 'Loading...'}
              >
                <option value={repoInfo?.url || 'Loading...'}>
                  {repoInfo?.url || 'Loading repository...'}
                </option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setHasLoaded(false);
                loadFiles();
              }}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              title="Load/Refresh files"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                       hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile when editing */}
        <div 
          data-sidebar
          className={`flex-shrink-0 relative ${currentFile ? 'hidden lg:block' : 'block'}`}
          style={{ width: sidebarWidth }}
        >
          <FileList
            files={files}
            selectedFile={selectedFile || undefined}
            onFileSelect={handleFileSelect}
            onNewFile={handleNewFile}
            isLoading={isLoading}
            sidebarWidth={sidebarWidth}
            userInfo={{
              name: session?.user?.name || session?.user?.username || 'Test User',
              role: session?.user?.role || 'developer'
            }}
          />
          
          {/* Resize Handle */}
          <div
            className={`absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors duration-200 group ${isResizing ? 'bg-blue-500 bg-opacity-50' : ''}`}
            onMouseDown={handleMouseDown}
          >
            {/* Visual indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-gray-300 group-hover:bg-blue-500 transition-colors duration-200 rounded-full"></div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative">
          {selectedFile && !currentFile ? (
            /* Loading state when file is selected but not yet loaded */
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading {selectedFile}...</p>
              </div>
            </div>
          ) : currentFile ? (
            <div className="flex flex-col h-full">
              {/* Mobile Back Button */}
              <div className="lg:hidden bg-white dark:bg-gray-800 px-4 py-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Files
                </button>
              </div>
              
              <div className="flex-1 relative">
                {/* Loading overlay for file switching */}
                {isEditorLoading && (
                  <LoadingOverlay text={`Loading ${selectedFile}...`} />
                )}
                <MarkdownEditor
                  file={currentFile}
                  onSave={handleSaveFile}
                  onCancel={handleCancelEdit}
                  isLoading={isEditorLoading}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-8">
              <div className="text-center max-w-md mb-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Welcome to {appConfig.app.displayName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a file from the sidebar to start editing, or create a new file to get started.
                </p>
                <button
                  onClick={handleNewFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create File Modal */}
      <CreateFileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFile}
        existingFiles={files.map(f => f.name)}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// Export with dynamic import to prevent SSR
export default dynamic(() => Promise.resolve(DashboardContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Dashboard...</p>
      </div>
    </div>
  )
});