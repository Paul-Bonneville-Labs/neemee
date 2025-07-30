import { NextResponse } from 'next/server';
import { getGitHubConfig } from '@/lib/github';

export async function GET() {
  try {
    const config = getGitHubConfig();
    
    return NextResponse.json({
      success: true,
      data: {
        owner: config.owner,
        repo: config.repo,
        url: `https://github.com/${config.owner}/${config.repo}`,
      },
    });
  } catch (error) {
    console.error('Error getting repository config:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get repository configuration',
      },
      { status: 500 }
    );
  }
}