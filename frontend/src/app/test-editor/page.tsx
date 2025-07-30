'use client';

import { useState } from 'react';
import { SimpleMarkdownEditor } from '@/components/SimpleMarkdownEditor';

// Sample markdown content for testing
const sampleMarkdown = `# Test Document

This is a **test document** for the markdown editor.

## Features

- Basic markdown support
- *Italic text*
- **Bold text**
- [Links](https://example.com)

## Code Block

Here's a simple code example:

\`console.log("Hello, world!");\`

## Lists

1. First item
2. Second item
3. Third item

- Bullet point
- Another bullet point

> This is a blockquote

---

That's the end of the test document.
`;

export default function TestEditorPage() {
  const [content, setContent] = useState(sampleMarkdown);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Markdown Editor Test</h1>
        <p className="text-gray-600 mb-6">
          This is a simple test page with a default MDXEditor implementation.
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <SimpleMarkdownEditor
            initialContent={content}
            onChange={setContent}
          />
        </div>
      </div>
    </div>
  );
}