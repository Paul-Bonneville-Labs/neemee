import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey, validateUrl, validateHighlightText } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NoteCaptureResponse } from '@/types';

// CORS headers for bookmarklet requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, snippet, page_url, note_title, api_key } = body;

    let userId: string;

    // Try session authentication first (for bookmarklet via capture page)
    try {
      const { auth } = await import('@/auth');
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
        
        // Ensure user exists in database (for JWT strategy with PrismaAdapter)
        await prisma.user.upsert({
          where: { id: userId },
          update: {}, // No updates needed if user exists
          create: {
            id: userId,
            email: session.user.email!,
            name: session.user.name || null,
            image: session.user.image || null,
          }
        });
      } else {
        throw new Error('No session');
      }
    } catch {
      // Fallback to API key authentication (for direct API calls)
      if (!api_key || typeof api_key !== 'string') {
        const response: NoteCaptureResponse = {
          success: false,
          message: 'Authentication required. Please log in or provide a valid API key.',
        };
        return NextResponse.json(response, { 
          status: 401,
          headers: corsHeaders 
        });
      }

      const authenticatedUserId = await authenticateApiKey(api_key);
      if (!authenticatedUserId) {
        const response: NoteCaptureResponse = {
          success: false,
          message: 'Invalid API key',
        };
        return NextResponse.json(response, { 
          status: 401,
          headers: corsHeaders 
        });
      }
      userId = authenticatedUserId;
    }

    // Validate content (use existing validation logic adapted for content)
    const contentValidation = validateHighlightText(content);
    if (!contentValidation.valid) {
      const response: NoteCaptureResponse = {
        success: false,
        message: contentValidation.error || 'Invalid content',
      };
      return NextResponse.json(response, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Validate page URL (allow null for manually created notes)
    if (page_url !== null && (!page_url || typeof page_url !== 'string' || !validateUrl(page_url))) {
      const response: NoteCaptureResponse = {
        success: false,
        message: 'Invalid page URL',
      };
      return NextResponse.json(response, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Validate and sanitize optional fields
    const sanitizedTitle = note_title && typeof note_title === 'string' 
      ? note_title.substring(0, 500) 
      : null;

    const sanitizedSnippet = snippet && typeof snippet === 'string'
      ? snippet.trim()
      : null;

    // Format content as markdown quote with URL if it's a snippet from a webpage
    const formattedContent = sanitizedSnippet && page_url
      ? `> ${sanitizedSnippet}\n\n${page_url.trim()}`
      : content.trim();

    // Save note to database using Prisma
    let note;
    try {
      note = await prisma.note.create({
        data: {
          content: formattedContent,
          snippet: sanitizedSnippet, // Store the original unmodified text if provided
          noteTitle: sanitizedTitle || 'Untitled Note',
          markdownContent: '', // Empty string - will be set by async extraction
          pageUrl: page_url ? page_url.trim() : null,
          domain: (() => {
            if (!page_url) return '';
            try {
              return new URL(page_url).hostname;
            } catch {
              return '';
            }
          })(),
          capturedAt: new Date(), // Set the capture timestamp
          user: {
            connect: { id: userId }
          }
        },
        select: {
          id: true
        }
      });
    } catch (dbError) {
      console.error('Database error creating note:', dbError);
      const response: NoteCaptureResponse = {
        success: false,
        message: 'Failed to save note to database',
      };
      return NextResponse.json(response, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const response: NoteCaptureResponse = {
      success: true,
      message: 'Note saved successfully!',
      noteId: note.id,
    };

    return NextResponse.json(response, { 
      status: 201,
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Error capturing note:', error);
    const response: NoteCaptureResponse = {
      success: false,
      message: 'Internal server error',
    };
    return NextResponse.json(response, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}