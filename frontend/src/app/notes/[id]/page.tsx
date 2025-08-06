'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Note, NoteUpdateRequest, ApiResponse } from '@/types';
import { ArrowLeft, Save, Trash2, ExternalLink } from 'lucide-react';
import { SimpleMarkdownEditor } from '@/components/SimpleMarkdownEditor';
import { formatDetailedDate } from '@/lib/dateUtils';
import { ToastContainer, useToasts } from '@/components/Toast';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';

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
  
  // Snippet height tracking
  const snippetRef = useRef<HTMLDivElement>(null);
  const [shouldShowFade, setShouldShowFade] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load note data
  const loadNote = useCallback(async () => {
    if (!noteId || !user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notes/${noteId}`, {
        credentials: 'include',
      });
      const result: ApiResponse<Note> = await response.json();
      
      if (result.success && result.data) {
        const noteData = result.data;
        setNote(noteData);
        
        // Set form data
        setFormData({
          content: noteData.content || '',
          snippet: noteData.snippet || '',
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

  // Check snippet height to determine if fade should be shown
  useEffect(() => {
    if (formData.snippet && snippetRef.current) {
      const element = snippetRef.current;
      const lineHeight = 32; // text-xl with leading-relaxed is approximately 32px per line
      const sixLinesHeight = lineHeight * 6; // ~192px
      
      setShouldShowFade(element.scrollHeight > sixLinesHeight);
    }
  }, [formData.snippet]);

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
      
      const response = await fetch(`/api/notes/${note.id}`, {
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
      
      const response = await fetch(`/api/notes/${note.id}`, {
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
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100">
        {/* Header */}
        <header className="bg-base-100/50 backdrop-blur-lg border-b border-base-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-base-content/70 hover:text-base-content"
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
              <p className="text-base-content/70">Loading note details...</p>
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
    <div className="bg-base-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-base-100/50 backdrop-blur-lg border-b border-base-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => {
                console.log('Back button clicked');
                router.push('/');
              }}
              className="flex items-center gap-2 text-base-content/70 hover:text-base-content transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="btn btn-error"
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
          {formData.snippet && (
            <div>
              <label htmlFor="snippet" className="block text-sm font-medium mb-2 text-base-content">
                Original Snippet
              </label>
              <div className={`relative ${shouldShowFade ? 'overflow-hidden' : ''}`}>
                <div 
                  ref={snippetRef}
                  className={`text-xl leading-relaxed text-base-content ${
                    shouldShowFade ? 'max-h-72 overflow-hidden' : ''
                  }`}
                >
                  {formData.snippet}
                </div>
                {/* Gradient fade-out overlay - only show when content is long */}
                {shouldShowFade && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-base-100 via-base-100/80 to-transparent pointer-events-none"></div>
                )}
              </div>
            </div>
          )}

          {/* Editable Content */}
          <div className="space-y-6">
            {/* Page Title */}
            <div>
              <label htmlFor="page_title" className="block text-sm font-medium mb-2 text-base-content">
                Page Title
              </label>
              <input
                id="page_title"
                type="text"
                value={formData.page_title}
                onChange={(e) => handleFormChange('page_title', e.target.value)}
                className="input input-bordered w-full bg-base-200 focus:bg-base-100"
                placeholder="Enter page title..."
              />
            </div>

            {/* Page URL */}
            <div>
              <label htmlFor="page_url" className="block text-sm font-medium mb-2 text-base-content">
                Source URL
              </label>
              <div className="relative">
                <input
                  id="page_url"
                  type="url"
                  value={formData.page_url}
                  onChange={(e) => handleFormChange('page_url', e.target.value)}
                  className="input input-bordered w-full pr-10 bg-base-200 focus:bg-base-100"
                  placeholder="https://example.com"
                />
                {formData.page_url && (
                  <a
                    href={formData.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content/70"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2 text-base-content">
                Content
              </label>
              <div className="bg-white rounded-lg p-4 border border-base-300">
                <SimpleMarkdownEditor
                  initialContent={formData.content}
                  onChange={(content) => handleFormChange('content', content)}
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-2">
            <h3 className="text-lg font-semibold mb-4 text-base-content">Note Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2 text-base-content">Note ID</div>
                <div className="px-4 py-3 bg-base-200 rounded-lg font-mono cursor-text text-base-content">
                  {note.id}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2 text-base-content">Created</div>
                <div className="px-4 py-3 bg-base-200 rounded-lg cursor-text text-base-content">
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
        onConfirm={() => {
          handleDelete();
        }}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}