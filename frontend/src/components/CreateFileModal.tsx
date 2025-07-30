'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (filename: string) => void;
  existingFiles: string[];
}

export function CreateFileModal({ isOpen, onClose, onSubmit, existingFiles }: CreateFileModalProps) {
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate filename
    const trimmed = filename.trim();
    if (!trimmed) {
      setError('Filename is required');
      return;
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\-_.\s]+$/.test(trimmed)) {
      setError('Filename can only contain letters, numbers, spaces, hyphens, underscores, and dots');
      return;
    }

    // Ensure .md extension
    const finalFilename = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;

    // Check for duplicates
    if (existingFiles.includes(finalFilename)) {
      setError('A file with this name already exists');
      return;
    }

    onSubmit(finalFilename);
    handleClose();
  };

  const handleClose = () => {
    setFilename('');
    setError('');
    onClose();
  };

  const handleFilenameChange = (value: string) => {
    setFilename(value);
    setError(''); // Clear error when user types
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Create New File
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label 
                  htmlFor="filename" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Filename
                </label>
                <input
                  type="text"
                  id="filename"
                  value={filename}
                  onChange={(e) => handleFilenameChange(e.target.value)}
                  placeholder="my-document"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm 
                    ${error 
                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    }
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    placeholder-gray-500 dark:placeholder-gray-400
                    focus:outline-none focus:ring-2`}
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Extension .md will be added automatically if not present
                </p>
                {error && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>

              {/* Preview */}
              {filename.trim() && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">File will be created as:</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {filename.trim().endsWith('.md') ? filename.trim() : `${filename.trim()}.md`}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                           bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                           rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!filename.trim() || !!error}
                  className="px-4 py-2 text-sm font-medium text-white 
                           bg-blue-600 hover:bg-blue-700 focus:bg-blue-700
                           border border-transparent rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200"
                >
                  Create File
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}