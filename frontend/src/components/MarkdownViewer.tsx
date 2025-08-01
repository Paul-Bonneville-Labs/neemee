'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin, 
  linkPlugin, 
  quotePlugin,
  thematicBreakPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
  imagePlugin
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './SimpleMarkdownEditor.css';
import { Loader2, FileText, Clock, BarChart3 } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  metadata?: {
    word_count?: number;
    reading_time_minutes?: number;
    character_count?: number;
    extraction_source?: string;
    page_title?: string;
    page_description?: string;
    [key: string]: any;
  };
  isLoading?: boolean;
  className?: string;
}

function MDXViewerComponent({ content, metadata, isLoading = false, className = '' }: MarkdownViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`min-h-[400px] bg-gray-50 dark:bg-gray-800 animate-pulse rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-[400px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || content.trim().length === 0) {
    return (
      <div className={`min-h-[400px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Content Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              The full page content is being processed and will be available shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Content Metadata Header */}
      {metadata && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              {metadata.word_count && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BarChart3 className="h-4 w-4" />
                  <span>{metadata.word_count.toLocaleString()} words</span>
                </div>
              )}
              {metadata.reading_time_minutes && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{metadata.reading_time_minutes} min read</span>
                </div>
              )}
            </div>
            {metadata.extraction_source && (
              <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                Extracted via {metadata.extraction_source}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Markdown Content */}
      <div className="p-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <MDXEditor
            markdown={content}
            readOnly={true}
            contentEditableClassName="mdx-viewer-content"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              linkPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              codeBlockPlugin({
                defaultCodeBlockLanguage: 'text',
                codeMirrorExtensions: []
              }),
              codeMirrorPlugin({
                codeBlockLanguages: {
                  js: 'JavaScript',
                  javascript: 'JavaScript',
                  ts: 'TypeScript',
                  typescript: 'TypeScript',
                  python: 'Python',
                  py: 'Python',
                  bash: 'Bash',
                  shell: 'Shell',
                  json: 'JSON',
                  html: 'HTML',
                  css: 'CSS',
                  sql: 'SQL',
                  yaml: 'YAML',
                  yml: 'YAML',
                  xml: 'XML',
                  markdown: 'Markdown',
                  md: 'Markdown',
                  text: 'Plain Text'
                }
              }),
              tablePlugin(),
              imagePlugin()
            ]}
            className="mdx-viewer"
          />
        </div>
      </div>
    </div>
  );
}

// Export with dynamic import to prevent SSR issues
export const MarkdownViewer = dynamic(() => Promise.resolve(MDXViewerComponent), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] bg-gray-50 dark:bg-gray-800 animate-pulse rounded-lg">
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    </div>
  )
});

export default MarkdownViewer;