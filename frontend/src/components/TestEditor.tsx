'use client';

import { MDXEditor, headingsPlugin, listsPlugin, toolbarPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const testContent = `# Test Heading

This is a test paragraph with **bold** and *italic* text.

## Sub Heading

- List item 1
- List item 2
- List item 3

### Another Heading

This is more content to test the editor.`;

export function TestEditor() {
  return (
    <div className="h-96 border border-gray-300 rounded-lg">
      <MDXEditor
        markdown={testContent}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          toolbarPlugin({
            toolbarContents: () => <div>Test Toolbar</div>
          })
        ]}
        className="h-full"
      />
    </div>
  );
}