# Text Management Application - Product Requirements Document

## Overview

A comprehensive text management system designed to capture, organize, and leverage textual knowledge within an organization. The system centers around four core components that work together to create a unified knowledge ecosystem backed by markdown files and version-controlled through GitHub.

## Core Components (Phase 1)

### Authentication System
**Purpose**: Secure access control based on GitHub repository permissions

**Features**:
- GitHub OAuth integration for seamless login
- Automatic role mapping from repository collaborator permissions
- Session management with secure token handling

### File Management Interface
**Purpose**: Simple interface for browsing and managing markdown files

**Features**:
- Left sidebar showing all .md files in repository root
- "New File" button to create content
- Click-to-edit functionality for existing files
- File status indicators (saved, editing, pending review)

### Markdown Editor
**Purpose**: User-friendly editing experience for content creation

**Features**:
- Split interface: frontmatter form above, markdown editor below
- Live preview of markdown content
- YAML frontmatter editing with form fields
- Auto-save functionality with visual feedback

### GitHub Integration
**Purpose**: Seamless workflow integration with repository management

**Features**:
- Automatic branch creation for edits
- Pull request generation with descriptive titles
- File synchronization with repository state
- Conflict detection and resolution guidance

## System Architecture (Phase 1)

### Data Layer
- GitHub repository as single source of truth
- Markdown files stored in repository root directory
- YAML frontmatter embedded in markdown files for metadata
- Git-based version control for all content changes

### Application Layer
- Next.js web application with server-side rendering
- GitHub OAuth for authentication and authorization
- Real-time file synchronization with repository
- Responsive design optimized for desktop and mobile

### Integration Layer
- GitHub API for file operations and user management
- Automated branch creation and pull request workflow
- Repository permission mapping to application roles

## User Workflows

### User Authentication Workflow
1. User visits landing page and clicks "Login with GitHub"
2. GitHub OAuth redirects user to authenticate
3. System checks user's permissions on configured repository
4. User role is determined based on GitHub repository access level
5. User is redirected to main application interface

### File Management Workflow
1. User sees list of all markdown files in repository root on left sidebar
2. User can click "New File" to open creation modal
3. User can click any existing file to load it in the editor
4. Editor shows markdown content with separate frontmatter form above
5. User edits content and/or frontmatter as needed

### Save and Review Workflow
1. User clicks "Save" on any new or edited content
2. System creates a feature branch with timestamp-based name
3. System commits the markdown file (with frontmatter embedded) to the branch
4. System automatically creates a pull request for review
5. Repository maintainers review and merge the PR to publish changes
6. File list updates automatically after merge

## Key Features

### Cross-Component Integration
- Unified search across all four components
- Automatic cross-referencing and linking
- Relationship mapping and visualization
- Consistent tagging and categorization

### Content Intelligence
- Automatic categorization using AI/ML
- Duplicate detection and merging suggestions
- Content gap analysis and recommendations
- Usage analytics and optimization insights

### Collaboration Features
- Multi-user editing with conflict resolution
- Approval workflows for sensitive content
- Comment and discussion threads
- Role-based access control

### API and Integrations
- RESTful API for external tool integration
- Webhook support for real-time updates
- Export capabilities for various formats
- Integration with common productivity suites

## Implementation Phases

### Phase 1: Core MVP (Simplified)
- Landing page with GitHub OAuth login
- User roles based on GitHub repository permissions
- Simple file list showing all markdown files in repository root
- Markdown editor with frontmatter form
- Create/edit workflow that generates pull requests for review
- Mobile-responsive interface with basic navigation

### Phase 2: Organization Features
- Codex search and categorization
- Lexicon term management
- Basic cross-component linking
- User authentication and permissions

### Phase 3: Intelligence Layer
- AI-powered categorization
- Advanced relationship mapping
- Duplicate detection system
- Analytics and insights dashboard

### Phase 4: Advanced Features
- Collaborative editing workflows
- Advanced browser integration
- External integrations
- Performance optimization and scaling

## Success Metrics

- **Adoption**: Number of active users and content contributions
- **Efficiency**: Time reduction in finding relevant information
- **Quality**: Accuracy of automated categorization and suggestions
- **Growth**: Volume and diversity of content in the system
- **Engagement**: Cross-component navigation and content relationships utilized

## Technical Specifications

### Data Storage and Management

#### Repository Structure (Phase 1 Simplified)
- **Primary Storage**: GitHub repository as single source of truth
- **Content Format**: Markdown files (.md) with YAML frontmatter
- **File Location**: All files stored in repository root directory
- **Editor**: MDX editor for enhanced editing experience (works with .md files)
- **Directory Structure**:
  ```
  your-repo/
  ├── README.md
  ├── document-1.md
  ├── document-2.md
  ├── meeting-notes.md
  └── project-plan.md
  ```

#### Content Schema (Simplified)
```yaml
# YAML Frontmatter Example
---
title: "Document Title"
author: "username"
created: "2025-01-01T00:00:00Z"
modified: "2025-01-01T00:00:00Z"
tags: ["tag1", "tag2"]
status: "draft"
---
# Markdown Content Here

Your markdown content goes here...

Regular markdown syntax with enhanced editing experience.
```

#### Content Schema
```yaml
# YAML Frontmatter Example
---
id: unique-identifier
title: Content Title
component: nexus|codex|lexicon|harvester
category: primary-category
tags: [tag1, tag2, tag3]
created: ISO-8601-timestamp
modified: ISO-8601-timestamp
author: author-identifier
source: original-source-url
status: draft|published|archived
relationships:
  - type: relates-to|contains|references
    target: target-content-id
metadata:
  confidence: 0.0-1.0
  auto-generated: boolean
---
# Markdown Content Here
```

#### Version Control
- **System**: Git-based versioning for all content changes
- **Branching Strategy**: Feature branches for major content additions
- **Commit Messages**: Structured format for automated processing
- **Merge Process**: Pull request workflow with review requirements

### Backend Infrastructure (Next.js API Routes)

#### API Architecture
- **Framework**: Next.js API Routes (App Router)
- **Data Source**: GitHub Repository via GitHub API
- **Authentication**: NextAuth.js session validation
- **Response Format**: JSON with consistent error handling

#### Core API Routes (Phase 1 Simplified)
```text
/api/auth/[...nextauth]              # NextAuth.js authentication
/api/files/list                      # Get all .md files in repo root
/api/files/[filename]                # Get specific file content and frontmatter
/api/files/create                    # Create new markdown file
/api/files/update                    # Update existing markdown file
/api/github/user-permissions         # Current user's repo permissions
/api/github/create-pr               # Create pull request for changes
```

#### GitHub Integration (for .md files with MDX editor)
```typescript
// lib/github.ts - Core file operations for .md files
export class GitHubFileManager {
  async listFiles(): Promise<FileInfo[]> {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: '', // Repository root only
    });
    
    return Array.isArray(data) 
      ? data.filter(file => file.name.endsWith('.md'))
      : [];
  }
  
  async getFile(filename: string): Promise<{ content: string; frontmatter: any; sha: string }> {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filename,
    });
    
    if ('content' in data) {
      const fileContent = Buffer.from(data.content, 'base64').toString();
      const { content, data: frontmatter } = matter(fileContent);
      return { content, frontmatter, sha: data.sha };
    }
    
    throw new Error('File not found');
  }
  
  async saveFile(
    filename: string, 
    content: string, 
    frontmatter: any,
    isNew: boolean = false
  ): Promise<{ pullRequestUrl: string }> {
    // 1. Create feature branch
    const branch = `edit-${filename.replace('.md', '')}-${Date.now()}`;
    await this.createBranch(branch);
    
    // 2. Prepare markdown file content with frontmatter
    const fullContent = matter.stringify(content, {
      ...frontmatter,
      modified: new Date().toISOString(),
    });
    
    // 3. Commit file to branch
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filename,
      message: `${isNew ? 'Create' : 'Update'} ${filename}`,
      content: Buffer.from(fullContent).toString('base64'),
      branch: branch,
    });
    
    // 4. Create pull request
    const { data: pr } = await octokit.rest.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `${isNew ? 'Add' : 'Update'} ${filename}`,
      head: branch,
      base: 'main',
      body: `${isNew ? 'Created' : 'Updated'} via web interface\n\nMarkdown content edited with enhanced MDX editor.`,
    });
    
    return { pullRequestUrl: pr.html_url };
  }
}
```

### Frontend Application

### Frontend Application

#### Technology Stack (Phase 1 MVP)
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: NextAuth.js with GitHub OAuth provider
- **Content**: Markdown files (.md) with YAML frontmatter
- **Editor**: @mdxeditor/editor for enhanced markdown editing experience
- **Components**: Optional MDX components available for future enhancement
- **Git Operations**: Octokit for GitHub API integration

#### Application Structure (Simplified)
```
src/
├── app/
│   ├── api/
│   │   ├── auth/             # NextAuth.js configuration
│   │   ├── files/            # File CRUD operations
│   │   └── github/           # GitHub workflow operations
│   ├── components/
│   │   ├── FileList.tsx      # Left sidebar file listing
│   │   ├── MarkdownEditor.tsx # MDX editor for .md files
│   │   ├── FrontmatterForm.tsx # YAML frontmatter form
│   │   ├── CreateFileModal.tsx # New file creation modal
│   │   └── mdx/              # Optional MDX components (future)
│   ├── page.tsx              # Landing page with login
│   ├── dashboard/            # Main application after login
│   │   └── page.tsx
│   └── layout.tsx            # Root layout component
├── lib/
│   ├── github.ts             # GitHub API client
│   ├── auth.ts               # Authentication helpers
│   ├── markdown.ts           # Markdown processing utilities
│   └── mdx.ts                # MDX utilities (for future enhancement)
└── types/
    └── index.ts              # TypeScript definitions
```

#### UI Layout Structure (Phase 1)
```
┌─────────────────────────────────────────────────────────────┐
│ Header: App Name                              Login/User     │
├─────────────────────────────────────────────────────────────┤
│ Left Sidebar    │           Main Content Area               │
│                │                                           │
│ [+ New File]    │  ┌─ Frontmatter Form ─────────────┐      │
│                │  │ Title: [________________]      │      │
│ □ README.md     │  │ Author: [______________]       │      │
│ □ project.md    │  │ Tags: [________________]       │      │
│ □ notes.md      │  │ Status: [dropdown_____]        │      │
│                │  └─────────────────────────────────┘      │
│                │                                           │
│                │  ┌─ MDX Editor (for .md files) ───┐      │
│                │  │ # Document Title               │      │
│                │  │                                │      │
│                │  │ Your markdown content with     │      │
│                │  │ enhanced editing experience... │      │
│                │  │                                │      │
│                │  └─────────────────────────────────┘      │
│                │                                           │
│                │  [Save Changes] [Cancel]                  │
└─────────────────────────────────────────────────────────────┘
```

#### MDX Editor Component (for .md files)
```typescript
// components/MarkdownEditor.tsx - Using MDX editor for .md files
import { MDXEditor, headingsPlugin, listsPlugin, linkPlugin, quotePlugin, markdownShortcutPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface MarkdownEditorProps {
  content: string;
  frontmatter: Record<string, any>;
  onSave: (content: string, frontmatter: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

export function MarkdownEditor({ content, frontmatter, onSave, onCancel }: MarkdownEditorProps) {
  const [markdownContent, setMarkdownContent] = useState(content);
  const [metadata, setMetadata] = useState(frontmatter);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(markdownContent, metadata);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <FrontmatterForm 
        frontmatter={metadata} 
        onChange={setMetadata} 
      />
      
      <div className="flex-1 mt-4">
        <MDXEditor
          markdown={markdownContent}
          onChange={setMarkdownContent}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            linkPlugin(),
            quotePlugin(),
            markdownShortcutPlugin()
          ]}
          className="min-h-[600px]"
          contentEditableClassName="prose max-w-none"
        />
      </div>
      
      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button 
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

#### Optional MDX Components (Future Enhancement)
```typescript
// components/mdx/index.tsx - Available for future use when needed
export const mdxComponents = {
  // These components would be available if/when users want to upgrade to .mdx
  Callout: ({ children, type = 'info' }: { 
    children: React.ReactNode; 
    type?: 'info' | 'warning' | 'error' | 'success' 
  }) => (
    <div className={`p-4 rounded-lg border-l-4 my-4 ${
      type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-900' :
      type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-900' :
      type === 'error' ? 'bg-red-50 border-red-500 text-red-900' :
      'bg-green-50 border-green-500 text-green-900'
    }`}>
      {children}
    </div>
  ),
  
  Badge: ({ children, variant = 'default' }: { 
    children: React.ReactNode; 
    variant?: 'default' | 'success' | 'warning' | 'error' 
  }) => (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
      variant === 'success' ? 'bg-green-100 text-green-800' :
      variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
      variant === 'error' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {children}
    </span>
  ),
};
```

#### File Management System (Updated for .md files)
```typescript
// lib/github.ts - File operations for .md files
export class GitHubFileManager {
  async listMarkdownFiles(): Promise<FileInfo[]> {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: '', // Repository root
    });
    
    // Filter for .md files only
    return Array.isArray(data) 
      ? data.filter(file => file.name.endsWith('.md'))
      : [];
  }
  
  async getFileContent(filename: string): Promise<{ content: string; frontmatter: any }> {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filename,
    });
    
    if ('content' in data) {
      const fileContent = Buffer.from(data.content, 'base64').toString();
      return parseMarkdownWithFrontmatter(fileContent);
    }
    
    throw new Error('File not found');
  }
  
  async saveFile(filename: string, content: string, frontmatter: any): Promise<string> {
    // Create branch, commit file, create PR
    const branch = await this.createFeatureBranch();
    const fullContent = `---\n${yaml.dump(frontmatter)}---\n\n${content}`;
    
    await this.commitFile(branch, filename, fullContent);
    const pr = await this.createPullRequest(branch, `Update ${filename}`);
    
    return pr.html_url;
  }
}
```

#### UI Layout Structure
```text
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo | Nexus | Codex | Lexicon | Admin    Login    │
├─────────────────────────────────────────────────────────────┤
│ Left Sidebar  │           Main Content            │ Right   │
│              │                                   │ TOC     │
│ - Category 1  │  # Page Title                     │ - H1    │
│ - Category 2  │                                   │ - H2    │
│ - Category 3  │  Content rendered from markdown   │   - H3  │
│              │  with proper formatting...        │ - H2    │
│              │                                   │         │
│ (Collapsible │                                   │ (Sticky │
│  on mobile)  │                                   │  scroll)│
└─────────────────────────────────────────────────────────────┘
```

#### Authentication and User Management
- **Provider**: GitHub OAuth via NextAuth.js
- **User Roles**: Mapped from GitHub repository permissions
  - **Owner**: Full admin access (repository owner)
  - **Maintainer**: Content editing and organization (repository maintainer)
  - **Contributor**: Content creation only (repository write access)
  - **Reader**: Read-only access (repository read access)
- **Session Management**: JWT tokens with GitHub user data
- **Authorization**: Middleware-based route protection

```typescript
// User role mapping from GitHub
interface UserRole {
  github_id: string;
  username: string;
  role: 'owner' | 'maintainer' | 'contributor' | 'reader';
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
    delete: boolean;
  };
}
```

### Browser Integration

#### Bookmarklet Implementation
```javascript
// Bookmarklet Core Functionality
(function() {
  const selectedText = window.getSelection().toString();
  const pageHTML = document.documentElement.outerHTML;
  const metadata = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    selection: selectedText,
    context: extractContext(selectedText)
  };
  
  // Send to ingestion API
  fetch('https://your-domain.com/api/v1/harvester/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getAuthToken()
    },
    body: JSON.stringify({
      selectedText,
      pageHTML,
      metadata
    })
  });
})();
```

#### Browser Extension (Optional)
- **Manifest**: Manifest V3 for Chrome/Edge compatibility
- **Content Scripts**: Enhanced text selection and context capture
- **Background Service**: Persistent connection management
- **Popup Interface**: Quick access to recent captures

### Deployment and Infrastructure

### Deployment and Infrastructure (Google Cloud Run)

#### Hosting Strategy (Phase 1)
- **Application**: Google Cloud Run with buildpacks (auto-detected Node.js)
- **Data Storage**: GitHub repository (no separate database)
- **Authentication**: NextAuth.js with GitHub OAuth
- **Build**: Automatic buildpack detection for Next.js
- **Secrets**: 
  - **Local Development**: .env files (convenient, fast iteration)
  - **Production**: Google Cloud Secret Manager (secure, managed)

#### Local Development Environment Setup
```bash
# .env.local (for local development only - never commit!)
GITHUB_TOKEN=ghp_xxxxx
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repo-name
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret-key
GITHUB_CLIENT_ID=your-oauth-app-id
GITHUB_CLIENT_SECRET=your-oauth-secret
```

```bash
# .env.example (committed to repo as template)
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-content-repo-name
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
```

```gitignore
# .gitignore (ensure secrets never get committed)
.env
.env.local
.env.production
.env.*.local
```

#### Production Secret Management
```bash
# Create secrets in Google Cloud Secret Manager (one-time setup)
gcloud secrets create github-token --data-file=- <<< "ghp_xxxxx"
gcloud secrets create github-repo-owner --data-file=- <<< "your-username"
gcloud secrets create github-repo-name --data-file=- <<< "your-repo-name"
gcloud secrets create nextauth-secret --data-file=- <<< "your-production-secret-key"
gcloud secrets create github-client-id --data-file=- <<< "your-oauth-app-id"
gcloud secrets create github-client-secret --data-file=- <<< "your-oauth-secret"
```

#### Cloud Run Deployment (with Secret Manager)
```bash
# Deploy with secret bindings (production)
gcloud run deploy text-management-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --update-secrets="GITHUB_TOKEN=github-token:latest" \
  --update-secrets="GITHUB_REPO_OWNER=github-repo-owner:latest" \
  --update-secrets="GITHUB_REPO_NAME=github-repo-name:latest" \
  --update-secrets="NEXTAUTH_SECRET=nextauth-secret:latest" \
  --update-secrets="GITHUB_CLIENT_ID=github-client-id:latest" \
  --update-secrets="GITHUB_CLIENT_SECRET=github-client-secret:latest" \
  --set-env-vars="NEXTAUTH_URL=https://text-management-app-xxxxxxxxx-uc.a.run.app"
```

#### Application Configuration (Works with Both)
```typescript
// lib/config.ts - Unified configuration for local and production
export const config = {
  github: {
    token: process.env.GITHUB_TOKEN!,
    repoOwner: process.env.GITHUB_REPO_OWNER!,
    repoName: process.env.GITHUB_REPO_NAME!,
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required environment variables on startup
const requiredVars = [
  'GITHUB_TOKEN',
  'GITHUB_REPO_OWNER', 
  'GITHUB_REPO_NAME',
  'NEXTAUTH_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

#### Development Workflow
```bash
# Quick Start Development
# 1. Clone the repository
git clone https://github.com/your-org/text-management-app
cd text-management-app

# 2. Install dependencies
npm install

# 3. Set up local environment
cp .env.example .env.local
# Edit .env.local with your actual values

# 4. Run development server
npm run dev

# 5. Deploy to production (secrets managed in Cloud)
npm run deploy:prod
```

#### Secret Synchronization Workflow

**Bash Script Sync Utility**
```bash
# scripts/sync-secrets.sh - Bidirectional sync utility
#!/bin/bash

case "$1" in
  "push")
    # Push local .env.local values to Cloud Secrets
    echo "Pushing local environment to Cloud Secrets..."
    
    # Read .env.local and create/update secrets
    export $(grep -v '^#' .env.local | xargs)
    
    gcloud secrets versions add github-token --data-file=- <<< "$GITHUB_TOKEN"
    gcloud secrets versions add github-repo-owner --data-file=- <<< "$GITHUB_REPO_OWNER"
    gcloud secrets versions add github-repo-name --data-file=- <<< "$GITHUB_REPO_NAME"
    gcloud secrets versions add nextauth-secret --data-file=- <<< "$NEXTAUTH_SECRET"
    gcloud secrets versions add github-client-id --data-file=- <<< "$GITHUB_CLIENT_ID"
    gcloud secrets versions add github-client-secret --data-file=- <<< "$GITHUB_CLIENT_SECRET"
    
    echo "✅ Secrets pushed to Cloud Secret Manager"
    ;;
    
  "pull")
    # Pull Cloud Secrets to local .env.local
    echo "Pulling Cloud Secrets to local environment..."
    
    cat > .env.local << EOF
# Generated from Cloud Secrets on $(date)
GITHUB_TOKEN=$(gcloud secrets versions access latest --secret="github-token")
GITHUB_REPO_OWNER=$(gcloud secrets versions access latest --secret="github-repo-owner")
GITHUB_REPO_NAME=$(gcloud secrets versions access latest --secret="github-repo-name")
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(gcloud secrets versions access latest --secret="nextauth-secret")
GITHUB_CLIENT_ID=$(gcloud secrets versions access latest --secret="github-client-id")
GITHUB_CLIENT_SECRET=$(gcloud secrets versions access latest --secret="github-client-secret")
EOF
    
    echo "✅ Local .env.local updated from Cloud Secrets"
    ;;
    
  "compare")
    # Compare local vs cloud values
    echo "Comparing local .env.local with Cloud Secrets..."
    
    export $(grep -v '^#' .env.local | xargs)
    
    echo "Checking GITHUB_TOKEN..."
    CLOUD_TOKEN=$(gcloud secrets versions access latest --secret="github-token")
    if [ "$GITHUB_TOKEN" != "$CLOUD_TOKEN" ]; then
      echo "  ❌ GITHUB_TOKEN differs"
    else
      echo "  ✅ GITHUB_TOKEN matches"
    fi
    
    echo "Checking GITHUB_REPO_OWNER..."
    CLOUD_OWNER=$(gcloud secrets versions access latest --secret="github-repo-owner")
    if [ "$GITHUB_REPO_OWNER" != "$CLOUD_OWNER" ]; then
      echo "  ❌ GITHUB_REPO_OWNER differs"
    else
      echo "  ✅ GITHUB_REPO_OWNER matches"
    fi
    
    echo "Checking GITHUB_REPO_NAME..."
    CLOUD_NAME=$(gcloud secrets versions access latest --secret="github-repo-name")
    if [ "$GITHUB_REPO_NAME" != "$CLOUD_NAME" ]; then
      echo "  ❌ GITHUB_REPO_NAME differs"
    else
      echo "  ✅ GITHUB_REPO_NAME matches"
    fi
    
    echo "Checking NEXTAUTH_SECRET..."
    CLOUD_SECRET=$(gcloud secrets versions access latest --secret="nextauth-secret")
    if [ "$NEXTAUTH_SECRET" != "$CLOUD_SECRET" ]; then
      echo "  ❌ NEXTAUTH_SECRET differs"
    else
      echo "  ✅ NEXTAUTH_SECRET matches"
    fi
    
    echo "Checking GITHUB_CLIENT_ID..."
    CLOUD_CLIENT_ID=$(gcloud secrets versions access latest --secret="github-client-id")
    if [ "$GITHUB_CLIENT_ID" != "$CLOUD_CLIENT_ID" ]; then
      echo "  ❌ GITHUB_CLIENT_ID differs"
    else
      echo "  ✅ GITHUB_CLIENT_ID matches"
    fi
    
    echo "Checking GITHUB_CLIENT_SECRET..."
    CLOUD_CLIENT_SECRET=$(gcloud secrets versions access latest --secret="github-client-secret")
    if [ "$GITHUB_CLIENT_SECRET" != "$CLOUD_CLIENT_SECRET" ]; then
      echo "  ❌ GITHUB_CLIENT_SECRET differs"
    else
      echo "  ✅ GITHUB_CLIENT_SECRET matches"
    fi
    ;;
    
  *)
    echo "Usage: $0 {push|pull|compare}"
    echo "  push    - Push local .env.local to Cloud Secrets"
    echo "  pull    - Pull Cloud Secrets to local .env.local"
    echo "  compare - Compare local vs cloud values"
    exit 1
    ;;
esac
```

#### Package.json Scripts (Updated)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "secrets:push": "bash scripts/sync-secrets.sh push",
    "secrets:pull": "bash scripts/sync-secrets.sh pull",
    "secrets:compare": "bash scripts/sync-secrets.sh compare",
    "secrets:init": "cp .env.example .env.local && echo 'Edit .env.local with your values, then run: npm run secrets:push'",
    "deploy:dev": "gcloud run deploy text-management-app-dev --source . --region us-central1",
    "deploy:prod": "npm run secrets:compare && gcloud run deploy text-management-app --source . --region us-central1 --update-secrets=GITHUB_TOKEN=github-token:latest --update-secrets=NEXTAUTH_SECRET=nextauth-secret:latest --update-secrets=GITHUB_REPO_OWNER=github-repo-owner:latest --update-secrets=GITHUB_REPO_NAME=github-repo-name:latest --update-secrets=GITHUB_CLIENT_ID=github-client-id:latest --update-secrets=GITHUB_CLIENT_SECRET=github-client-secret:latest"
  }
}
```

#### Recommended Workflow
```bash
# Initial setup (new team member)
npm run secrets:init        # Creates .env.local from template
# Edit .env.local with actual values
npm run secrets:push        # Push to cloud for first time

# Regular development
npm run dev                 # Use local .env.local

# Before deploying
npm run secrets:compare     # Check if local and cloud are in sync
npm run secrets:push        # Update cloud if needed
npm run deploy:prod         # Deploy with cloud secrets

# When secrets change in cloud (team coordination)
npm run secrets:pull        # Update local .env.local from cloud
```

#### Script Setup
```bash
# Make the script executable
chmod +x scripts/sync-secrets.sh

# Create the scripts directory if it doesn't exist
mkdir -p scripts
```

#### Automated Deployment with Cloud Build
```yaml
# cloudbuild.yaml for production deployment
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'text-management-app'
      - '--source'
      - '.'
      - '--region'
      - 'us-central1'
      - '--allow-unauthenticated'
      - '--update-secrets=GITHUB_TOKEN=github-token:latest'
      - '--update-secrets=GITHUB_REPO_OWNER=github-repo-owner:latest'
      - '--update-secrets=GITHUB_REPO_NAME=github-repo-name:latest'
      - '--update-secrets=NEXTAUTH_SECRET=nextauth-secret:latest'
      - '--update-secrets=GITHUB_CLIENT_ID=github-client-id:latest'
      - '--update-secrets=GITHUB_CLIENT_SECRET=github-client-secret:latest'
```

### Security and Performance (Phase 1)

#### Authentication and Authorization
- **OAuth Provider**: GitHub OAuth 2.0 via NextAuth.js
- **Session Management**: Secure HTTP-only cookies
- **Role Mapping**: Direct from GitHub repository permissions
- **API Protection**: Middleware validation for protected routes

#### Performance Optimization (MVP)
- **Next.js Features**: 
  - Automatic code splitting
  - Image optimization
  - Static generation where possible
- **Caching Strategy**: 
  - GitHub API responses cached for 5 minutes
  - Static markdown content cached until repository changes
- **Mobile Optimization**: Responsive design with collapsible sidebars

#### Security Considerations
- **Environment Variables**: Secure secret management
- **CORS Configuration**: Restricted origins for API endpoints
- **Input Validation**: Sanitization of user inputs and markdown content
- **GitHub Token Scope**: Minimal required permissions (repo read access)

### Development Environment (Simplified)

#### Local Setup Requirements
- **Node.js**: Version 18+ 
- **Package Manager**: npm or yarn
- **GitHub Account**: For OAuth and repository access
- **Git**: For content repository management

#### Development Dependencies (Phase 1 with MDX Editor for .md files)
```json
{
  "dependencies": {
    "next": "^15.4.1",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next-auth": "^4.24.0",
    "@mdxeditor/editor": "^1.18.0",
    "@octokit/rest": "^20.0.0",
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/js-yaml": "^4.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

#### GitHub Repository Setup (Phase 1)
```
your-content-repo/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md    # PR template for content changes
├── README.md                       # Repository documentation  
├── example-document.md             # Sample markdown content file
├── meeting-notes.md               # Another sample file
└── project-plan.md                # Another sample file
```

#### Markdown Content Template (Enhanced editing with MDX editor)
```markdown
---
title: "Document Title"
author: "your-username"
created: "2025-01-01T00:00:00Z"
modified: "2025-01-01T00:00:00Z"
tags: ["documentation", "example"]
status: "draft"
---

# Document Title

Your markdown content goes here with enhanced editing experience from the MDX editor!

## Section 1

Regular markdown syntax with:
- Enhanced toolbar
- Live preview capabilities
- Rich text shortcuts
- Better editing experience

## Section 2

All standard markdown features work perfectly:

```javascript
// Code blocks with syntax highlighting
function example() {
  return "Enhanced editing experience";
}
```

> Blockquotes and other markdown elements work seamlessly

The MDX editor provides a superior editing experience while keeping files as simple .md format.
```