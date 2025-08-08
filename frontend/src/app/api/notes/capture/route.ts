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
    const { content, snippet, page_url, page_title, api_key } = body;

    // Validate API key
    if (!api_key || typeof api_key !== 'string') {
      const response: NoteCaptureResponse = {
        success: false,
        message: 'Missing or invalid API key',
      };
      return NextResponse.json(response, { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Authenticate user via API key
    const userId = await authenticateApiKey(api_key);
    if (!userId) {
      const response: NoteCaptureResponse = {
        success: false,
        message: 'Invalid API key',
      };
      return NextResponse.json(response, { 
        status: 401,
        headers: corsHeaders 
      });
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

    // Validate page URL
    if (!page_url || typeof page_url !== 'string' || !validateUrl(page_url)) {
      const response: NoteCaptureResponse = {
        success: false,
        message: 'Invalid or missing page URL',
      };
      return NextResponse.json(response, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Validate and sanitize optional fields
    const sanitizedTitle = page_title && typeof page_title === 'string' 
      ? page_title.substring(0, 500) 
      : null;

    const sanitizedSnippet = snippet && typeof snippet === 'string'
      ? snippet.trim()
      : null;

    // Format content as markdown quote with URL if it's a snippet from a webpage
    const formattedContent = sanitizedSnippet 
      ? `> ${sanitizedSnippet}\n\n${page_url.trim()}`
      : content.trim();

    // Save note to database using Prisma
    const note = await prisma.note.create({
      data: {
        userId: userId,
        content: formattedContent,
        snippet: sanitizedSnippet, // Store the original unmodified text if provided
        pageTitle: sanitizedTitle || 'Untitled Page',
        markdownContent: '', // Empty string - will be set by async extraction
        pageUrl: page_url.trim(),
        domain: new URL(page_url).hostname
      },
      select: {
        id: true
      }
    });

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