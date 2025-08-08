import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse, PrismaNotesLibraryResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Check authentication using Auth.js
    const session = await auth();
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

    // Build Prisma query filters
    const where: { [key: string]: unknown } = {
      userId: session.user.id
    };

    // Add search filter
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { pageTitle: { contains: search, mode: 'insensitive' } },
        { snippet: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add domain filter
    if (domain) {
      where.pageUrl = { contains: domain };
    }

    // Add date filters
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

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
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.note.count({ where })
    ]);

    const responseData: PrismaNotesLibraryResponse = {
      notes,
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