'use client';

import { useState, useEffect } from 'react';
import { 
  Edit3, 
  Database, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  Highlight, 
  HighlightEditTab, 
  HighlightEditProps, 
  HighlightFormData, 
  HighlightValidationErrors,
  HighlightUpdateRequest 
} from '@/types';

export function HighlightEditor({ 
  highlight, 
  onSave, 
  onCancel, 
  isLoading = false 
}: HighlightEditProps) {
  const [activeTab, setActiveTab] = useState<HighlightEditTab>('details');
  const [formData, setFormData] = useState<HighlightFormData>({
    highlighted_text: highlight.highlighted_text,
    page_title: highlight.page_title || '',
    page_url: highlight.page_url
  });
  const [errors, setErrors] = useState<HighlightValidationErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      formData.highlighted_text !== highlight.highlighted_text ||
      formData.page_title !== (highlight.page_title || '') ||
      formData.page_url !== highlight.page_url;
    setHasUnsavedChanges(hasChanges);
  }, [formData, highlight]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: HighlightValidationErrors = {};

    if (!formData.highlighted_text.trim()) {
      newErrors.highlighted_text = 'Highlighted text is required';
    } else if (formData.highlighted_text.length > 10000) {
      newErrors.highlighted_text = 'Highlighted text is too long (max 10,000 characters)';
    }

    if (formData.page_title.trim().length > 500) {
      newErrors.page_title = 'Page title is too long (max 500 characters)';
    }

    if (!formData.page_url.trim()) {
      newErrors.page_url = 'Page URL is required';
    } else {
      try {
        new URL(formData.page_url);
      } catch {
        newErrors.page_url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setErrors({});

      const updates: HighlightUpdateRequest = {
        highlighted_text: formData.highlighted_text.trim(),
        page_title: formData.page_title.trim() || undefined,
        page_url: formData.page_url.trim()
      };

      await onSave(updates);
    } catch (error) {
      console.error('Error saving highlight:', error);
      setErrors({ 
        highlighted_text: error instanceof Error ? error.message : 'Failed to save changes' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    onCancel();
  };

  const handleInputChange = (field: keyof HighlightFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs and actions */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Highlight
            </h2>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isLoading || isSaving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'details'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Edit3 className="h-4 w-4" />
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Highlighted Text */}
              <div>
                <label htmlFor="highlighted_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Highlighted Text *
                </label>
                <textarea
                  id="highlighted_text"
                  value={formData.highlighted_text}
                  onChange={(e) => handleInputChange('highlighted_text', e.target.value)}
                  disabled={isLoading || isSaving}
                  className={`w-full px-3 py-2 border rounded-lg text-sm resize-y min-h-[120px] ${
                    errors.highlighted_text
                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50`}
                  placeholder="Enter the highlighted text..."
                  rows={6}
                />
                {errors.highlighted_text && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.highlighted_text}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.highlighted_text.length} / 10,000 characters
                </p>
              </div>

              {/* Page Title */}
              <div>
                <label htmlFor="page_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  id="page_title"
                  value={formData.page_title}
                  onChange={(e) => handleInputChange('page_title', e.target.value)}
                  disabled={isLoading || isSaving}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    errors.page_title
                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50`}
                  placeholder="Enter the page title..."
                />
                {errors.page_title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.page_title}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.page_title.length} / 500 characters
                </p>
              </div>

              {/* Page URL */}
              <div>
                <label htmlFor="page_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page URL *
                </label>
                <input
                  type="url"
                  id="page_url"
                  value={formData.page_url}
                  onChange={(e) => handleInputChange('page_url', e.target.value)}
                  disabled={isLoading || isSaving}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    errors.page_url
                      ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50`}
                  placeholder="https://example.com/page"
                />
                {errors.page_url && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.page_url}</p>
                )}
              </div>

              {/* Save Actions (repeated for convenience) */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCancel}
                  disabled={isLoading || isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || isSaving || !hasUnsavedChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}