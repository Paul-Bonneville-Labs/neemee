'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
                <BlockTypeSelect />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <Separator />
                <InsertCodeBlock />
                <InsertTable />
                <InsertImage />
                <Separator />
                <InsertThematicBreak />
                <InsertFrontmatter />
              </DiffSourceToggleWrapper>
            )
          })
        ]}
        className="min-h-[400px]"
      />
    </div>
  );
}

export const SimpleMarkdownEditor = dynamic(() => Promise.resolve(MDXEditorComponent), {
  ssr: false,
  loading: () => <div className="min-h-[400px] bg-gray-50 animate-pulse rounded-lg"></div>
});