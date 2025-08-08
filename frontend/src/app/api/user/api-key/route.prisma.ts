import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApiKey, createApiKey, listApiKeys, deactivateApiKey } from '@/lib/api-auth.prisma';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
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

    // Get user's API keys using Prisma
    const apiKeys = await listApiKeys(session.user.id);

    if (apiKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No API key found. Please generate an API key first.' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: apiKeys,
      message: `Found ${apiKeys.length} API key(s)`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching API keys:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch API keys'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

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
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Create new API key using Prisma
    const result = await createApiKey(session.user.id, name.trim());
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to create API key' },
        { status: 500 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: {
        apiKey: result.apiKey,
        name: name.trim(),
        keyPrefix: result.keyPrefix
      },
      message: 'API key created successfully'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating API key:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create API key'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check delete permissions
    const hasDeletePermission = await hasPermission('delete');
    if (!hasDeletePermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'API key ID is required' },
        { status: 400 }
      );
    }

    // Deactivate API key using Prisma
    const success = await deactivateApiKey(session.user.id, keyId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to deactivate API key or key not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'API key deactivated successfully'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error deactivating API key:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate API key'
    };
    return NextResponse.json(response, { status: 500 });
  }
}