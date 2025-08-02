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
  imagePlugin,
  toolbarPlugin,
  markdownShortcutPlugin,
  linkDialogPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  InsertImage,
  CodeToggle,
  StrikeThroughSupSubToggles,
  DiffSourceToggleWrapper,
  ButtonWithTooltip,
  Separator
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './SimpleMarkdownEditor.css';
import { Loader2, FileText, Copy } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  isLoading?: boolean;
  className?: string;
  editable?: boolean;
  onChange?: (markdown: string) => void;
}

function MDXViewerComponent({ content, isLoading = false, className = '', editable = false, onChange }: MarkdownViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [originalContent, setOriginalContent] = useState(content);

  useEffect(() => {
    setMounted(true);
    
    // Check for dark mode on mount
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };
    
    checkDarkMode();
    
    // Listen for dark mode changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const observer = new MutationObserver(checkDarkMode);
    
    mediaQuery.addEventListener('change', checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  // Update original content only when switching to a completely different highlight (via key prop change)
  useEffect(() => {
    setOriginalContent(content);
  }, []); // Empty dependency array - only runs on mount

  // Copy markdown content to clipboard
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Optional: Show a brief success indicator
    } catch (err) {
      console.error('Failed to copy content:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

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
      <div className={`min-h-[400px] rounded-lg border border-gray-200 ${className}`} style={{backgroundColor: '#fefdf8'}}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Extracting content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || content.trim().length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center py-12 px-6">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
              No Content Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the "Extract Text" button above to get the full content from this page's URL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 overflow-hidden ${className}`} style={{backgroundColor: '#fefdf8'}}>
      {/* Markdown Content */}
      <div className="p-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <MDXEditor
            markdown={content}
            readOnly={!editable}
            contentEditableClassName="mdx-viewer-content"
            onChange={onChange}
            plugins={[
              // Core plugins for both modes
              headingsPlugin(),
              listsPlugin(),
              linkPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              tablePlugin(),
              imagePlugin(),
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
              
              // Advanced plugins (only when editable)
              ...(editable ? [
                markdownShortcutPlugin(),
                linkDialogPlugin(),
                diffSourcePlugin({
                  viewMode: 'rich-text',
                  diffMarkdown: originalContent
                }),
                frontmatterPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <DiffSourceToggleWrapper>
                      <UndoRedo />
                      <Separator />
                      <BoldItalicUnderlineToggles />
                      <StrikeThroughSupSubToggles />
                      <Separator />
                      <BlockTypeSelect />
                      <Separator />
                      <ListsToggle />
                      <Separator />
                      <CreateLink />
                      <InsertImage />
                      <Separator />
                      <InsertTable />
                      <InsertThematicBreak />
                      <Separator />
                      <InsertCodeBlock />
                      <div style={{ flex: 1 }}></div>
                      <ButtonWithTooltip 
                        title="Copy Markdown"
                        onClick={handleCopyMarkdown}
                      >
                        <Copy className="h-4 w-4" />
                      </ButtonWithTooltip>
                    </DiffSourceToggleWrapper>
                  )
                })
              ] : [])
            ]}
            className={`mdx-viewer ${editable ? 'mdx-editor-editable' : ''}`}
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