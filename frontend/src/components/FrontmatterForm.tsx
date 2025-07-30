'use client';

import { useState } from 'react';
import { FrontmatterFormProps, FrontmatterData } from '@/types';

export function FrontmatterForm({ frontmatter, onChange, isReadOnly = false }: FrontmatterFormProps) {
  const [formData, setFormData] = useState<FrontmatterData>(frontmatter);

  const handleChange = (field: string, value: string | string[]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    handleChange('tags', tags);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <span className="mr-2">📝</span>
        Frontmatter
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-sm rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
            placeholder="Document title"
          />
        </div>

        {/* Author (read-only, set from session) */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Author
          </label>
          <input
            type="text"
            value={formData.author || ''}
            disabled
            className="w-full px-3 py-2 text-sm rounded-md 
                     bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            placeholder="Automatically set from user"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Status
          </label>
          <select
            value={formData.status || 'draft'}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-sm rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
            onChange={(e) => handleTagsChange(e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2 text-sm rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate tags with commas
          </p>
        </div>
      </div>

      {/* Timestamps (read-only) */}
      <div className="grid grid-cols-1 gap-4 mt-4 pt-4">
        {formData.created && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Created
            </label>
            <input
              type="text"
              value={new Date(formData.created).toLocaleString()}
              disabled
              className="w-full px-3 py-2 text-sm rounded-md 
                       bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>
        )}

        {formData.modified && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Last Modified
            </label>
            <input
              type="text"
              value={new Date(formData.modified).toLocaleString()}
              disabled
              className="w-full px-3 py-2 text-sm rounded-md 
                       bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>
        )}
      </div>

      {/* Custom fields support */}
      {Object.entries(formData).map(([key, value]) => {
        if (['title', 'author', 'created', 'modified', 'tags', 'status'].includes(key)) {
          return null;
        }

        return (
          <div key={key} className="mt-4">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <input
              type="text"
              value={typeof value === 'string' ? value : JSON.stringify(value)}
              onChange={(e) => handleChange(key, e.target.value)}
              disabled={isReadOnly}
              className="w-full px-3 py-2 text-sm rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
            />
          </div>
        );
      })}
    </div>
  );
}