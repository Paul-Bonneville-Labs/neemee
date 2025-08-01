import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { githubClient } from '@/lib/github';
import { ApiResponse, FrontmatterData } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    // Check authentication
    const session = await getSession();
    console.log('Session in GET /api/files/[filename]:', session ? 'exists' : 'null');
    console.log('Request cookies:', request.cookies.toString());
    
    if (!session || !session.user) {
      console.log('No session or user, returning 401');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check read permissions
    const hasReadPermission = await hasPermission('read');
    if (!hasReadPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { filename } = await params;
    
    // Validate filename parameter
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid filename parameter' },
        { status: 400 }
      );
    }
    
    const decodedFilename = decodeURIComponent(filename);
    
    // Validate decoded filename format - allow spaces, forward slashes for directories, but prevent path traversal
    if (!/^[a-zA-Z0-9._\s\/-]+\.md$/.test(decodedFilename) || decodedFilename.includes('..') || decodedFilename.includes('\\')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path format. Must end with .md and contain only letters, numbers, spaces, dots, underscores, hyphens, and forward slashes' },
        { status: 400 }
      );
    }
    
    console.log('Fetching file:', decodedFilename);
    
    // Get file content from GitHub
    const file = await githubClient.getFileContent(decodedFilename);
    console.log('File loaded successfully:', file.filename);

    const response: ApiResponse = {
      success: true,
      data: file,
      message: `Retrieved content for ${decodedFilename}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error getting file:`, error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file content',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check write permissions
    const hasWritePermission = await hasPermission('write');
    if (!hasWritePermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { filename } = await params;
    
    // Validate filename parameter
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid filename parameter' },
        { status: 400 }
      );
    }
    
    const decodedFilename = decodeURIComponent(filename);
    
    // Validate decoded filename format - allow spaces, forward slashes for directories, but prevent path traversal
    if (!/^[a-zA-Z0-9._\s\/-]+\.md$/.test(decodedFilename) || decodedFilename.includes('..') || decodedFilename.includes('\\')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path format. Must end with .md and contain only letters, numbers, spaces, dots, underscores, hyphens, and forward slashes' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { content, frontmatter, sha } = body;

    // Validate required fields
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid content' },
        { status: 400 }
      );
    }

    if (!frontmatter || typeof frontmatter !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid frontmatter' },
        { status: 400 }
      );
    }

    if (!sha || typeof sha !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid sha' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 1000000) {
      return NextResponse.json(
        { success: false, error: 'Content too large. Maximum 1MB allowed' },
        { status: 400 }
      );
    }

    // Update file in GitHub
    const result = await githubClient.updateFile(decodedFilename, content, frontmatter as FrontmatterData, sha);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: result.message,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error updating file:`, error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update file',
    };
    return NextResponse.json(response, { status: 500 });
  }
}