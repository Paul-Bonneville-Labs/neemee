import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { githubClient } from '@/lib/github';
import { ApiResponse, FrontmatterData } from '@/types';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { filename, content, frontmatter } = body;

    // Validate required fields
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid filename' },
        { status: 400 }
      );
    }

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

    // Validate filename format - allow spaces and common characters but prevent path traversal
    if (!/^[a-zA-Z0-9._\s-]+\.md$/.test(filename) || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename format. Must end with .md and contain only letters, numbers, spaces, dots, underscores, and hyphens' },
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

    // Add author information from session
    const enhancedFrontmatter: FrontmatterData = {
      ...frontmatter,
      author: session.user.username || session.user.name || 'unknown',
    };

    // Create file in GitHub
    const result = await githubClient.createFile(filename, content, enhancedFrontmatter);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: result.message,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating file:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create file',
    };
    return NextResponse.json(response, { status: 500 });
  }
}