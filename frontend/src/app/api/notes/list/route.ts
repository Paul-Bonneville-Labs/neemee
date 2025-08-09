import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { buildNoteSearchFilters } from '@/lib/api-auth';
import { ApiResponse, NotesLibraryResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Check authentication using Auth.js
    const session = await auth();
    console.log('API Session Debug:', {
      hasSession: !!session,
      user: session?.user,
      userId: session?.user?.id
    });
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search')?.trim();
    const domain = searchParams.get('domain')?.trim();
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    const offset = (page - 1) * limit;

    // Build Prisma query filters using reusable helper
    const where = buildNoteSearchFilters({
      userId: session.user.id,
      search,
      domain,
      startDate,
      endDate
    });

    // Execute Prisma queries concurrently for better performance
    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where,
        select: {
          id: true,
          userId: true,
          content: true,
          snippet: true,
          pageUrl: true,
          pageTitle: true,
          markdownContent: true,
          metadata: true,
          domain: true,
          capturedAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.note.count({ where })
    ]);


    // Transform Prisma result to match frontend Note interface
    const transformedNotes = notes.map(note => ({
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt?.toISOString() || null,
      capturedAt: note.capturedAt?.toISOString() || null,
    }));

    const responseData: NotesLibraryResponse = {
      notes: transformedNotes,
      pagination: {
        total: totalCount,
        page,
        limit
      }
    };

    const response: ApiResponse = {
      success: true,
      data: responseData,
      message: `Found ${notes.length} notes`,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error listing notes with Prisma:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list notes',
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}