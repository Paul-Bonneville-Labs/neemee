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

// Highlight management types
export interface Highlight {
  id: string;
  user_id: string;
  highlighted_text: string;
  original_quote?: string; // The original unmodified text as captured
  page_url: string;
  page_title?: string;
  markdown_content?: string;
  created_at: string;
  updated_at?: string;
}

export interface HighlightCreateRequest {
  highlighted_text: string;
  url: string;
  title?: string;
  opengraph_data?: Record<string, string>;
  api_key: string;
}

export interface HighlightUpdateRequest {
  highlighted_text: string;
  title?: string;
  url?: string;
}

export interface HighlightFormData {
  highlighted_text: string;
  title: string;
  url: string;
}

export interface HighlightValidationErrors {
  highlighted_text?: string;
  title?: string;
  url?: string;
}

export type HighlightEditTab = 'details' | 'content';

export interface HighlightEditProps {
  highlight: Highlight;
  onSave: (updates: HighlightUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface HighlightListResponse {
  highlights: Highlight[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface HighlightCaptureResponse {
  success: boolean;
  message: string;
  highlightId?: string;
}

export interface UserApiKey {
  id: string;
  api_key: string;
  api_key_created_at: string;
  created_at: string;
}

export interface BookmarkletResponse {
  success: boolean;
  bookmarklet: string;
  instructions: string;
}

export interface HighlightListProps {
  highlights: Highlight[];
  selectedHighlight?: string;
  onHighlightSelect: (highlightId: string) => void;
  onDeleteHighlight: (highlightId: string) => void;
  onViewBookmarklet: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Bookmarklet Dashboard Types
export interface ApiKeyManagerProps {
  apiKey: UserApiKey | null;
  onUpdate: (apiKey: UserApiKey) => void;
  className?: string;
}

export interface BookmarkletInstallerProps {
  bookmarklet: BookmarkletResponse | null;
  isReady: boolean;
  className?: string;
}

export interface BookmarkletInstructionsProps {
  hasApiKey: boolean;
  hasBookmarklet: boolean;
  className?: string;
}

export interface HighlightStatsProps {
  highlights: HighlightListResponse | null;
  onRefresh?: () => void;
  className?: string;
}

export interface BookmarkletDashboardProps {
  className?: string;
}

// Statistics and Analytics Types
export interface DomainStat {
  domain: string;
  count: number;
  percentage: number;
  recentCount: number;
}

export interface ActivityStat {
  date: string;
  count: number;
}

export interface HighlightStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  domains: DomainStat[];
  activity: ActivityStat[];
  recent: Highlight[];
}

// Browser Detection Types
export interface BrowserInfo {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

// Installation Step Types
export interface InstallationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

// FAQ Types
export interface FAQItem {
  question: string;
  answer: string;
  category: 'setup' | 'usage' | 'troubleshooting';
}