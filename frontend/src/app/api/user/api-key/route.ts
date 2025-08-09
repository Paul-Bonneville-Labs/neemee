import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse, UserApiKey } from '@/types';
import { randomBytes, createHash } from 'crypto';

// GET - Retrieve user's API key
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the user's active API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        permissions: true
      }
    });

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'No API key found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<UserApiKey> = {
      success: true,
      data: {
        id: apiKey.id,
        api_key: apiKey.keyPrefix, // Show prefix only for security
        api_key_created_at: apiKey.createdAt.toISOString(),
        created_at: apiKey.createdAt.toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error retrieving API key:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve API key',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create or regenerate API key
export async function POST() {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate new API key
    const apiKeyValue = 'nmk_' + randomBytes(32).toString('hex');
    const keyHash = createHash('sha256').update(apiKeyValue).digest('hex');
    const keyPrefix = apiKeyValue.substring(0, 12); // Show first 12 chars as prefix

    // Deactivate existing API keys for this user
    await prisma.apiKey.updateMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Create new API key
    const newApiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        keyHash,
        keyPrefix,
        name: 'Default API Key',
        permissions: {
          capture: true,
          read: true,
          write: false
        },
        isActive: true
      }
    });

    const response: ApiResponse<UserApiKey & { fullKey: string }> = {
      success: true,
      data: {
        id: newApiKey.id,
        api_key: newApiKey.keyPrefix, // Show prefix only for security
        api_key_created_at: newApiKey.createdAt.toISOString(),
        created_at: newApiKey.createdAt.toISOString(),
        fullKey: apiKeyValue // Only returned on creation/regeneration
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating API key:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create API key',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}