'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useToasts, ToastContainer } from '@/components/Toast';
import { SimpleMarkdownEditor } from '@/components/SimpleMarkdownEditor';
import { Sidebar, HamburgerButton } from '@/components/Sidebar';
import appConfig from '../../../../config.json';

export default function NewNotePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toasts, dismissToast, showSuccess, showError } = useToasts();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push('/library');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Title is required');
      return;
    }

    if (!content.trim()) {
      showError('Content is required');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/notes/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          note_title: title.trim(),
          page_url: null, // No URL for manual notes
          snippet: null, // Manual notes don't have snippets
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess('Note created successfully');
        router.push('/library');
      } else {
        showError('Failed to create note', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      showError('Failed to create note', 'Network error occurred');
    } finally {
      setIsSaving(false);
    }
  };

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
              <Link href="/library" className="text-2xl font-bold text-base-content hover:text-primary transition-colors">
                {appConfig.app.name}
              </Link>
              <span className="ml-2 text-2xl text-base-content/70">New Note</span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="btn btn-ghost"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Library
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !content.trim()}
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Note Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter note title..."
              className="input input-bordered w-full bg-base-200 focus:bg-base-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Content</span>
            </label>
            <div className="bg-white rounded-lg border border-base-300">
              <SimpleMarkdownEditor
                initialContent={content}
                onChange={(newContent) => setContent(newContent)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}