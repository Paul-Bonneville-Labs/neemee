// User authentication types
export interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  role: UserRole;
  permissions: UserPermissions;
}

export type UserRole = 'owner' | 'maintainer' | 'contributor' | 'reader';

export interface UserPermissions {
  read: boolean;
  write: boolean;
  admin: boolean;
  delete: boolean;
}

// File management types
export interface FileInfo {
  name: string;
  path: string;
  directory: string; // Directory path (empty string for root)
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url?: string;
  git_url?: string;
  html_url?: string;
}

export interface MarkdownFile {
  filename: string;
  path?: string;
  content: string;
  frontmatter: FrontmatterData;
  sha: string;
  lastModified: string;
}

export interface FrontmatterData {
  title?: string;
  author?: string;
  created?: string;
  modified?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  [key: string]: string | string[] | undefined;
}

// GitHub integration types
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface CreateFileResponse {
  pullRequestUrl: string;
  branchName: string;
  message: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component prop types
export interface MarkdownEditorProps {
  file?: MarkdownFile;
  onSave: (content: string, frontmatter: FrontmatterData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface FileListProps {
  files: FileInfo[];
  selectedFile?: string;
  onFileSelect: (filename: string) => void;
  onNewFile: () => void;
  isLoading?: boolean;
}

export interface FrontmatterFormProps {
  frontmatter: FrontmatterData;
  onChange: (frontmatter: FrontmatterData) => void;
  isReadOnly?: boolean;
}