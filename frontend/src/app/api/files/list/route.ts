import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { githubClient } from '@/lib/github';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
    console.log('Session in GET /api/files/list:', session ? 'exists' : 'null');
    
    if (!session || !session.user) {
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

    // Get file list from GitHub
    const files = await githubClient.listMarkdownFiles();

    const response: ApiResponse = {
      success: true,
      data: files,
      message: `Found ${files.length} markdown files`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing files:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files',
    };
    return NextResponse.json(response, { status: 500 });
  }
}