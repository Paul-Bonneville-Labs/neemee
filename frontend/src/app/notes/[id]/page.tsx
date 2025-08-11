'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Note, NoteUpdateRequest, ApiResponse } from '@/types';
import { ArrowLeft, Save, Trash2, ExternalLink, Copy } from 'lucide-react';
import { Sidebar, HamburgerButton } from '@/components/Sidebar';
import appConfig from '../../../../config.json';
import { SimpleMarkdownEditor } from '@/components/SimpleMarkdownEditor';
import { formatDetailedDate } from '@/lib/dateUtils';
import { ToastContainer, useToasts } from '@/components/Toast';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';

export default function NoteDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toasts, dismissToast, showSuccess, showError } = useToasts();
  const noteId = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'frontmatter'>('content');
  
  // Form state for editing
  const [formData, setFormData] = useState({
    content: '',
    note_title: '',
    page_url: '',
    markdown_content: ''
  });
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  

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
          note_title: noteData.noteTitle || '',
          page_url: noteData.pageUrl || '',
          markdown_content: noteData.markdownContent || ''
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
        noteTitle: formData.note_title,
        pageUrl: formData.page_url
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
        showSuccess('Note saved successfully');
      } else {
        console.error('Failed to save note:', result.error);
        showError('Failed to save note', result.error || 'Please try again');
      }
    } catch (err) {
      console.error('Error saving note:', err);
      showError('Error saving note', err instanceof Error ? err.message : 'Please try again');
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

  // Copy content to clipboard
  const handleCopyContent = async () => {
    if (!formData.content) return;
    
    try {
      await navigator.clipboard.writeText(formData.content);
      showSuccess('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy content:', err);
      showError('Failed to copy content', 'Please try selecting and copying manually');
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
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-base-100/50 backdrop-blur-lg border-b border-base-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Hamburger */}
            <div className="flex items-center gap-3">
              <HamburgerButton 
                isOpen={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
              <Link href="/" className="text-2xl font-bold text-base-content hover:text-primary transition-colors">
                {appConfig.app.name}
              </Link>
              <span className="ml-2 text-2xl text-base-content/70">Note Details</span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  console.log('Back button clicked');
                  router.push('/');
                }}
                className="btn btn-ghost"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Library
              </button>
              
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation using DaisyUI tabs-border */}
        <div role="tablist" className="tabs tabs-border tabs-sm mb-6 gap-1">
          <input 
            type="radio" 
            name="note_tabs" 
            className="tab" 
            aria-label="Content"
            defaultChecked={activeTab === 'content'}
          />
          <div className="tab-content bg-base-100 border-base-300 rounded-lg p-6">
            {/* Note Title */}
            <div className="mb-6">
              <label htmlFor="note_title" className="block text-sm font-medium mb-2 text-base-content">
                Note Title
              </label>
              <input
                id="note_title"
                type="text"
                value={formData.note_title}
                onChange={(e) => handleFormChange('note_title', e.target.value)}
                className="input input-bordered w-full bg-base-200 focus:bg-base-100"
                placeholder="Enter note title..."
              />
            </div>
            
            {/* Markdown Content */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-base-content">
                  Markdown Content
                </label>
                {/* Copy button - always visible */}
                <button
                  onClick={handleCopyContent}
                  className="p-1.5 rounded-md bg-base-200/90 hover:bg-base-300/90 text-base-content/70 hover:text-base-content transition-all duration-200"
                  title="Copy content to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white rounded-lg p-4 border border-base-300">
                <SimpleMarkdownEditor
                  initialContent={formData.content}
                  onChange={(content) => handleFormChange('content', content)}
                />
              </div>
            </div>
          </div>


          <input 
            type="radio" 
            name="note_tabs" 
            className="tab" 
            aria-label="Frontmatter"
            defaultChecked={activeTab === 'frontmatter'}
          />
          <div className="tab-content bg-base-100 border-base-300 rounded-lg p-6">
            <div className="space-y-6">
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

              {/* Note Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2 text-base-content">Note ID</div>
                  <div className="px-4 py-3 bg-base-200 rounded-lg font-mono cursor-text text-base-content">
                    {note.id}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2 text-base-content">Captured</div>
                  <div className="px-4 py-3 bg-base-200 rounded-lg cursor-text text-base-content">
                    {formatDetailedDate(note.capturedAt || note.createdAt)}
                  </div>
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