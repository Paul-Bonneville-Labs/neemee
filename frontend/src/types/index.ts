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

// Note management types (API returns JSON-serialized data with string dates)
export interface Note {
  id: string;
  userId: string;
  content: string;
  snippet?: string | null; // The original unmodified text as captured
  pageUrl: string;
  pageTitle?: string | null;
  markdownContent?: string | null;
  domain: string;
  capturedAt?: string | null; // When the note was originally captured (ISO string)
  createdAt: string; // ISO string from API
  updatedAt?: string | null; // ISO string from API
  metadata?: unknown; // Use unknown to match Prisma JsonValue
}

export interface NoteCreateRequest {
  content: string;
  url: string;
  title?: string;
  opengraph_data?: Record<string, string>;
  api_key: string;
}

export interface NoteUpdateRequest {
  content: string;
  pageTitle?: string;
  pageUrl?: string;
}

export interface NoteFormData {
  content: string;
  title: string;
  url: string;
}

export interface NoteValidationErrors {
  content?: string;
  title?: string;
  url?: string;
}

export type NoteEditTab = 'details' | 'content';

export interface NoteEditProps {
  note: Note;
  onSave: (updates: NoteUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface NotesLibraryResponse {
  notes: Note[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface NoteCaptureResponse {
  success: boolean;
  message: string;
  noteId?: string;
}

export interface UserApiKey {
  id: string;
  api_key: string;
  api_key_created_at: string;
  created_at: string;
  fullKey?: string; // Only available when creating/regenerating
}

export interface BookmarkletResponse {
  success: boolean;
  bookmarklet: string;
  instructions: string;
}

export interface NotesGridProps {
  notes: Note[];
  selectedNote?: string;
  onNoteSelect: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onViewBookmarklet: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  sidebarWidth?: number;
  userInfo?: {
    name?: string;
    role?: string;
  };
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

export interface NoteStatsProps {
  notes: NotesLibraryResponse | null;
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

export interface NoteStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  domains: DomainStat[];
  activity: ActivityStat[];
  recent: Note[];
}

// Browser Detection Types
export interface BrowserInfo {
  name: string;
  icon: React.ComponentType<Record<string, unknown>>;
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

// Backward compatibility types (deprecated - use Note types instead)
// @deprecated Use Note instead
export type Highlight = Note;
// @deprecated Use NotesLibraryResponse instead  
export type HighlightListResponse = NotesLibraryResponse;
// @deprecated Use NoteUpdateRequest instead
export type HighlightUpdateRequest = NoteUpdateRequest;
// @deprecated Use NotesGridProps instead
export type HighlightListProps = NotesGridProps;