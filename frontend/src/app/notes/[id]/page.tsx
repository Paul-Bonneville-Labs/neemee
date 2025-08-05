'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Note, NoteUpdateRequest, ApiResponse } from '@/types';
import { ArrowLeft, Save, Trash2, ExternalLink, Calendar, Link } from 'lucide-react';
import { formatDetailedDate } from '@/lib/dateUtils';
import { ToastContainer, useToasts } from '@/components/Toast';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import appConfig from '../../../../config.json';

export default function NoteDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toasts, dismissToast } = useToasts();
  const noteId = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    content: '',
    snippet: '',
    page_title: '',
    page_url: '',
    markdown_content: ''
  });
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load note data
  const loadNote = useCallback(async () => {
    if (!noteId || !user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/highlights/${noteId}`, {
        credentials: 'include',
      });
      const result: ApiResponse<Note> = await response.json();
      
      if (result.success && result.data) {
        const noteData = result.data;
        setNote(noteData);
        
        // Set form data with backward compatibility
        setFormData({
          content: noteData.content || noteData.highlighted_text || '',
          snippet: noteData.snippet || noteData.original_quote || '',
          page_title: noteData.page_title || '',
          page_url: noteData.page_url || '',
          markdown_content: noteData.markdown_content || ''
        });
      } else {
        console.error('Failed to load note:', result.error);
        // Note not found, redirect to library
        router.push('/');
      }
    } catch (err) {
      console.error('Error loading note:', err);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [noteId, user, router]);

  useEffect(() => {
    if (user && mounted && noteId) {
      loadNote();
    }
  }, [user, mounted, noteId, loadNote]);

  // Handle form changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Save note changes
  const handleSave = async () => {
    if (!note) return;
    
    try {
      setIsSaving(true);
      
      const updateData: NoteUpdateRequest = {
        content: formData.content,
        page_title: formData.page_title,
        page_url: formData.page_url
      };
      
      const response = await fetch(`/api/highlights/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      const result: ApiResponse<Note> = await response.json();
      
      if (result.success && result.data) {
        setNote(result.data);
        setHasUnsavedChanges(false);
        // Show success toast (implementation depends on toast system)
      } else {
        console.error('Failed to save note:', result.error);
        // Show error toast
      }
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note
  const handleDelete = async () => {
    if (!note) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/highlights/${note.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (result.success) {
        // Note deleted successfully, redirect to library
        router.push('/');
      } else {
        console.error('Failed to delete note:', result.error);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Library
              </button>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading note details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!note) {
    return null; // Will redirect to library
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 disabled:bg-gray-400
                         border border-transparent rounded-lg focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200
                         disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                         bg-red-600 hover:bg-red-700 focus:bg-red-700
                         border border-transparent rounded-lg focus:outline-none focus:ring-2 
                         focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Original Snippet Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Captured Text</h2>
            <div className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 italic">
              {formData.snippet || 'No captured text available for this note'}
            </div>
          </div>

          {/* Editable Content */}
          <div className="space-y-6">
            {/* Page Title */}
            <div>
              <label htmlFor="page_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Title
              </label>
              <input
                id="page_title"
                type="text"
                value={formData.page_title}
                onChange={(e) => handleFormChange('page_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter page title..."
              />
            </div>

            {/* Page URL */}
            <div>
              <label htmlFor="page_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source URL
              </label>
              <div className="relative">
                <input
                  id="page_url"
                  type="url"
                  value={formData.page_url}
                  onChange={(e) => handleFormChange('page_url', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
                {formData.page_url && (
                  <a
                    href={formData.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                id="content"
                rows={8}
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter note content..."
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Note Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Note ID
                </label>
                <div className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                  {note.id}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Created
                </label>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDetailedDate(note.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        isDeleting={isDeleting}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}