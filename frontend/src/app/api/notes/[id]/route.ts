import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication using Auth.js
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format (assuming CUID format for Prisma)
    if (id.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    // Get note with user authorization check using Prisma
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      select: {
        id: true,
        userId: true,
        content: true,
        snippet: true,
        pageUrl: true,
        pageTitle: true,
        markdownContent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: note,
      message: `Retrieved note ${id}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting note:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get note',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication using Auth.js
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID parameter' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, page_title, page_url } = body;

    // Validate required fields
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'content is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (page_title && typeof page_title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'page_title must be a string' },
        { status: 400 }
      );
    }

    if (page_url && typeof page_url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'page_url must be a string' },
        { status: 400 }
      );
    }

    // Validate URL format if provided
    if (page_url) {
      try {
        new URL(page_url);
      } catch {
        return NextResponse.json(
          { success: false, error: 'page_url must be a valid URL' },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs
    const sanitizedContent = content.trim();
    const sanitizedTitle = page_title?.trim() || null;
    const sanitizedUrl = page_url?.trim();

    // Validate lengths
    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { success: false, error: 'content cannot be empty' },
        { status: 400 }
      );
    }

    if (sanitizedContent.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'content is too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    if (sanitizedTitle && sanitizedTitle.length > 500) {
      return NextResponse.json(
        { success: false, error: 'page_title is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: { [key: string]: unknown } = {
      content: sanitizedContent,
      updatedAt: new Date()
    };

    if (sanitizedTitle !== undefined) {
      updateData.pageTitle = sanitizedTitle;
    }

    if (sanitizedUrl !== undefined) {
      updateData.pageUrl = sanitizedUrl;
      
      // Update domain if URL changed
      if (sanitizedUrl && sanitizedUrl.trim()) {
        try {
          updateData.domain = new URL(sanitizedUrl).hostname;
        } catch {
          // Keep existing domain if URL is invalid
          console.log('PUT /api/notes/[id] - Invalid URL for domain extraction:', sanitizedUrl);
        }
      }
    }

    // Update note with user authorization check using Prisma
    const note = await prisma.note.update({
      where: {
        id,
        userId: session.user.id
      },
      data: updateData,
      select: {
        id: true,
        userId: true,
        content: true,
        snippet: true,
        pageUrl: true,
        pageTitle: true,
        markdownContent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: note,
      message: `Note ${id} updated successfully`,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Note not found or access denied' },
        { status: 404 }
      );
    }
    console.error('Error updating note:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update note',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication using Auth.js
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID parameter' },
        { status: 400 }
      );
    }

    // Delete note with user authorization check using Prisma
    await prisma.note.delete({
      where: {
        id,
        userId: session.user.id
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Note ${id} deleted successfully`,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Note not found or access denied' },
        { status: 404 }
      );
    }
    console.error('Error deleting note:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete note',
    };
    return NextResponse.json(response, { status: 500 });
  }
}