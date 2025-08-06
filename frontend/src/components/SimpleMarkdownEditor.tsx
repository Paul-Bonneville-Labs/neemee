'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Copy, Check } from 'lucide-react';
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin, 
  linkPlugin, 
  quotePlugin, 
  markdownShortcutPlugin,
  toolbarPlugin,
  thematicBreakPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
  imagePlugin,
  linkDialogPlugin,
  frontmatterPlugin,
  diffSourcePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  InsertCodeBlock,
  ListsToggle,
  CreateLink,
  InsertThematicBreak,
  InsertTable,
  InsertImage,
  InsertFrontmatter,
  BlockTypeSelect,
  DiffSourceToggleWrapper,
  Separator
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './SimpleMarkdownEditor.css';

interface SimpleMarkdownEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

function MDXEditorComponent({ initialContent, onChange }: SimpleMarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Custom Copy Button Component
  const CopyButton = () => (
    <button
      onClick={handleCopyToClipboard}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded border border-gray-600 dark:border-gray-300 transition-colors"
      title="Copy markdown to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );

  if (!mounted) {
    return <div className="min-h-[400px] bg-gray-50 animate-pulse rounded-lg"></div>;
  }

  return (
    <div className="w-full">
      <MDXEditor
        markdown={content}
        onChange={handleChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
          codeMirrorPlugin({ 
            codeBlockLanguages: { 
              javascript: 'JavaScript',
              typescript: 'TypeScript',
              jsx: 'JSX',
              tsx: 'TSX',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
              python: 'Python',
              bash: 'Bash',
              sql: 'SQL',
              markdown: 'Markdown',
              yaml: 'YAML',
              xml: 'XML',
              swift: 'Swift',
              ruby: 'Ruby'
            } 
          }),
          tablePlugin(),
          imagePlugin({
            imageUploadHandler: () => {
              return Promise.resolve('https://picsum.photos/200/300');
            }
          }),
          frontmatterPlugin(),
          diffSourcePlugin({ 
            viewMode: 'rich-text',
            diffMarkdown: ''
          }),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <ListsToggle />
                <CreateLink />
                <Separator />
                <InsertCodeBlock />
                <InsertTable />
                <Separator />
                <CopyButton />
              </DiffSourceToggleWrapper>
            )
          })
        ]}
        className=""
      />
    </div>
  );
}

export const SimpleMarkdownEditor = dynamic(() => Promise.resolve(MDXEditorComponent), {
  ssr: false,
  loading: () => <div className="h-20 bg-gray-50 animate-pulse rounded-lg"></div>
});