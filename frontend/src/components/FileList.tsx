'use client';

import { useState } from 'react';
import { FileIcon, PlusIcon, SearchIcon, UserIcon } from 'lucide-react';
import { FileListProps } from '@/types';

export function FileList({ 
  files, 
  selectedFile, 
  onFileSelect, 
  onNewFile, 
  isLoading = false,
  sidebarWidth,
  userInfo 
}: FileListProps & { sidebarWidth?: number; userInfo?: { name?: string; role?: string } }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.directory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group files by directory
  const groupedFiles = filteredFiles.reduce((groups, file) => {
    const directory = file.directory || 'Root';
    if (!groups[directory]) {
      groups[directory] = [];
    }
    groups[directory].push(file);
    return groups;
  }, {} as Record<string, typeof files>);

  // Sort directories: Root first, then alphabetically
  const sortedDirectories = Object.keys(groupedFiles).sort((a, b) => {
    if (a === 'Root') return -1;
    if (b === 'Root') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Files
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredFiles.length}
          </span>
        </div>
        
        {/* New File Button */}
        <button
          onClick={onNewFile}
          disabled={isLoading}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium 
                   text-white bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                   border border-transparent rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
          <PlusIcon className="h-4 w-4" />
          New File
        </button>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm 
                     rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-4 text-center">
            <FileIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No files match your search' : 'No markdown files found'}
            </p>
            {!searchTerm && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Create your first file to get started
              </p>
            )}
          </div>
        ) : (
          <div className="p-2 overflow-hidden">
            {sortedDirectories.map((directory) => (
              <div key={directory} className="mb-4">
                {/* Directory Header */}
                {directory !== 'Root' && (
                  <div className="flex items-center gap-2 px-2 py-1 mb-2 min-w-0">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate min-w-0">
                      {directory}
                    </span>
                  </div>
                )}
                
                {/* Files in this directory */}
                <div className={directory !== 'Root' ? 'ml-4' : ''}>
                  {groupedFiles[directory].map((file) => (
                    <button
                      key={file.path}
                      onClick={() => onFileSelect(file.path)}
                      title={file.path}
                      className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-colors duration-200 ${
                        selectedFile === file.path
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileIcon className={`h-4 w-4 flex-shrink-0 ${
                          selectedFile === file.path 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400'
                        }`} />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">
                              {file.name.replace('.md', '')}
                            </p>
                            <span className={`text-xs font-medium flex-shrink-0 ${
                              selectedFile === file.path
                                ? 'text-blue-900/50 dark:text-blue-100/50'
                                : 'text-gray-700/50 dark:text-gray-300/50'
                            }`}>
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* Footer - Fixed to bottom with dynamic width */}
      <div 
        className="fixed bottom-0 left-0 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10"
        style={{ width: sidebarWidth || 320 }}
      >
        <div className="flex items-center justify-start gap-2 text-xs">
          <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
            {userInfo?.name || 'Loading...'}
          </span>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium flex-shrink-0">
            {userInfo?.role || 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}