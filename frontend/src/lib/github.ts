import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import { FileInfo, MarkdownFile, FrontmatterData, CreateFileResponse, GitHubPullRequest } from '@/types';

// Lazy initialization of GitHub client to avoid build-time errors
let octokit: Octokit | null = null;
let config: { token: string; owner: string; repo: string } | null = null;

function initializeGitHubClient() {
  if (!config) {
    // Validate required environment variables at runtime
    const requiredVars = ['GITHUB_TOKEN', 'GITHUB_REPO_OWNER', 'GITHUB_REPO_NAME'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    config = {
      token: process.env.GITHUB_TOKEN!,
      owner: process.env.GITHUB_REPO_OWNER!,
      repo: process.env.GITHUB_REPO_NAME!,
    };
  }

  if (!octokit) {
    octokit = new Octokit({
      auth: config.token,
    });
  }

  return { octokit, config };
}

export class GitHubFileManager {
  /**
   * List all markdown files in the repository recursively
   */
  async listMarkdownFiles(): Promise<FileInfo[]> {
    try {
      const { octokit, config } = initializeGitHubClient();
      
      // Get the default branch to find the latest tree SHA
      const { data: repo } = await octokit.rest.repos.get({
        owner: config.owner,
        repo: config.repo,
      });
      
      const defaultBranch = repo.default_branch;
      
      // Get the tree recursively
      const { data: tree } = await octokit.rest.git.getTree({
        owner: config.owner,
        repo: config.repo,
        tree_sha: defaultBranch,
        recursive: 'true',
      });

      // Filter for .md files only and transform to FileInfo format
      const markdownFiles = tree.tree
        .filter(item => 
          item.type === 'blob' && 
          item.path && 
          item.path.endsWith('.md')
        )
        .map(file => {
          const pathParts = file.path!.split('/');
          const filename = pathParts[pathParts.length - 1];
          const directory = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : '';
          
          return {
            name: filename,
            path: file.path!,
            directory,
            sha: file.sha!,
            size: file.size || 0,
            type: 'file' as const,
            download_url: undefined, // Tree API doesn't provide download URLs
            git_url: file.url || undefined,
            html_url: undefined, // Will be constructed if needed
          };
        });

      // Sort files: root files first, then by directory, then by filename
      markdownFiles.sort((a, b) => {
        // Root files come first
        if (!a.directory && b.directory) return -1;
        if (a.directory && !b.directory) return 1;
        
        // Then sort by directory
        if (a.directory !== b.directory) {
          return a.directory.localeCompare(b.directory);
        }
        
        // Finally sort by filename
        return a.name.localeCompare(b.name);
      });

      return markdownFiles;
    } catch (error) {
      console.error('Error listing markdown files:', error);
      throw new Error('Failed to fetch file list from repository');
    }
  }

  /**
   * Get content and frontmatter for a specific markdown file
   */
  async getFileContent(filename: string): Promise<MarkdownFile> {
    try {
      const { octokit, config } = initializeGitHubClient();
      const { data } = await octokit.rest.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: filename,
      });

      if (!('content' in data)) {
        throw new Error('File not found or is a directory');
      }

      // Decode base64 content
      const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');
      
      // Parse frontmatter and content
      const parsed = matter(fileContent);
      
      return {
        filename,
        path: filename,
        content: parsed.content,
        frontmatter: parsed.data as FrontmatterData,
        sha: data.sha,
        lastModified: new Date().toISOString(), // GitHub doesn't provide last modified in content API
      };
    } catch (error) {
      console.error(`Error getting file content for ${filename}:`, error);
      throw new Error(`Failed to fetch content for ${filename}`);
    }
  }

  /**
   * Create a new markdown file with frontmatter
   */
  async createFile(
    filename: string,
    content: string,
    frontmatter: FrontmatterData
  ): Promise<CreateFileResponse> {
    try {
      const { octokit, config } = initializeGitHubClient();
      // Ensure filename ends with .md
      if (!filename.endsWith('.md')) {
        filename += '.md';
      }

      // Create branch name with timestamp
      const timestamp = Date.now();
      const branchName = `create-${filename.replace('.md', '')}-${timestamp}`;

      // Get the default branch reference
      const { data: mainBranch } = await octokit.rest.git.getRef({
        owner: config.owner,
        repo: config.repo,
        ref: 'heads/main',
      });

      // Create feature branch
      await octokit.rest.git.createRef({
        owner: config.owner,
        repo: config.repo,
        ref: `refs/heads/${branchName}`,
        sha: mainBranch.object.sha,
      });

      // Prepare frontmatter with creation timestamp
      const updatedFrontmatter = {
        ...frontmatter,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      };

      // Combine frontmatter and content
      const fullContent = matter.stringify(content, updatedFrontmatter);

      // Create file in the new branch
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: config.owner,
        repo: config.repo,
        path: filename,
        message: `Create ${filename}`,
        content: Buffer.from(fullContent).toString('base64'),
        branch: branchName,
      });

      // Create pull request
      const { data: pr } = await octokit.rest.pulls.create({
        owner: config.owner,
        repo: config.repo,
        title: `Add ${filename}`,
        head: branchName,
        base: 'main',
        body: `Created new markdown file: ${filename}\n\nGenerated via text management application.`,
      });

      return {
        pullRequestUrl: pr.html_url,
        branchName,
        message: `File ${filename} created successfully. Pull request #${pr.number} created.`,
      };
    } catch (error) {
      console.error(`Error creating file ${filename}:`, error);
      throw new Error(`Failed to create file ${filename}`);
    }
  }

  /**
   * Update an existing markdown file
   */
  async updateFile(
    filename: string,
    content: string,
    frontmatter: FrontmatterData,
    sha: string
  ): Promise<CreateFileResponse> {
    try {
      const { octokit, config } = initializeGitHubClient();
      // Create branch name with timestamp
      const timestamp = Date.now();
      const branchName = `edit-${filename.replace('.md', '')}-${timestamp}`;

      // Get the default branch reference
      const { data: mainBranch } = await octokit.rest.git.getRef({
        owner: config.owner,
        repo: config.repo,
        ref: 'heads/main',
      });

      // Create feature branch
      await octokit.rest.git.createRef({
        owner: config.owner,
        repo: config.repo,
        ref: `refs/heads/${branchName}`,
        sha: mainBranch.object.sha,
      });

      // Update frontmatter with modification timestamp
      const updatedFrontmatter = {
        ...frontmatter,
        modified: new Date().toISOString(),
      };

      // Combine frontmatter and content
      const fullContent = matter.stringify(content, updatedFrontmatter);

      // Update file in the new branch
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: config.owner,
        repo: config.repo,
        path: filename,
        message: `Update ${filename}`,
        content: Buffer.from(fullContent).toString('base64'),
        branch: branchName,
        sha, // Required for updates
      });

      // Create pull request
      const { data: pr } = await octokit.rest.pulls.create({
        owner: config.owner,
        repo: config.repo,
        title: `Update ${filename}`,
        head: branchName,
        base: 'main',
        body: `Updated markdown file: ${filename}\n\nGenerated via text management application.`,
      });

      return {
        pullRequestUrl: pr.html_url,
        branchName,
        message: `File ${filename} updated successfully. Pull request #${pr.number} created.`,
      };
    } catch (error) {
      console.error(`Error updating file ${filename}:`, error);
      throw new Error(`Failed to update file ${filename}`);
    }
  }

  /**
   * Get user's permissions for the repository
   */
  async getUserPermissions(username: string): Promise<{ permission: string; user: { login: string; avatar_url: string } }> {
    try {
      const { octokit, config } = initializeGitHubClient();
      const { data } = await octokit.rest.repos.getCollaboratorPermissionLevel({
        owner: config.owner,
        repo: config.repo,
        username,
      });

      return {
        permission: data.permission,
        user: {
          login: data.user?.login || username,
          avatar_url: data.user?.avatar_url || '',
        },
      };
    } catch (error) {
      console.error(`Error getting permissions for ${username}:`, error);
      throw new Error(`Failed to get repository permissions for ${username}`);
    }
  }

  /**
   * List recent pull requests for the repository
   */
  async getRecentPullRequests(limit: number = 10): Promise<GitHubPullRequest[]> {
    try {
      const { octokit, config } = initializeGitHubClient();
      const { data } = await octokit.rest.pulls.list({
        owner: config.owner,
        repo: config.repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: limit,
      });

      return data.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body || '',
        html_url: pr.html_url,
        state: pr.state as 'open' | 'closed' | 'merged',
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        user: {
          login: pr.user?.login || 'unknown',
          avatar_url: pr.user?.avatar_url || '',
        },
      }));
    } catch (error) {
      console.error('Error getting recent pull requests:', error);
      throw new Error('Failed to fetch recent pull requests');
    }
  }

  /**
   * Check if the repository exists and is accessible
   */
  async validateRepositoryAccess(): Promise<boolean> {
    try {
      const { octokit, config } = initializeGitHubClient();
      await octokit.rest.repos.get({
        owner: config.owner,
        repo: config.repo,
      });
      return true;
    } catch (error) {
      console.error('Repository access validation failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const githubClient = new GitHubFileManager();

// Export configuration getter for use in other modules
export function getGitHubConfig() {
  const { config } = initializeGitHubClient();
  return config;
}