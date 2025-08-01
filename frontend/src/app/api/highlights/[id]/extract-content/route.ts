import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/api-auth';

interface ContentExtractionRequest {
  highlight_id: string;
  url: string;
  highlighted_text: string;
  page_title?: string;
}

interface ContentExtractionResponse {
  status: string;
  highlight_id: string;
  markdown_content?: string;
  content_preview?: string;
  extraction_metadata?: any;
  errors?: string[];
  processing_time_ms?: number;
}

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const highlightId = params.id;
    console.log('Content extraction request for highlight:', highlightId);
    
    // Authenticate user
    const authContext = await getAuthContext(request);
    console.log('Auth context:', authContext ? { userId: authContext.userId } : 'null');
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authContext;

    // Get the highlight from database to verify ownership and get details
    const supabase = await createClient();
    console.log('Looking up highlight with id:', highlightId, 'for user:', userId);
    
    const { data: highlight, error: fetchError } = await supabase
      .from('highlights')
      .select('*')
      .eq('id', highlightId)
      .eq('user_id', userId)
      .single();

    console.log('Database query result:', { 
      highlight: highlight ? { id: highlight.id, url: highlight.url, title: highlight.title } : null, 
      error: fetchError 
    });

    if (fetchError || !highlight) {
      console.error('Highlight lookup failed:', { fetchError, highlightId, userId });
      return NextResponse.json({ 
        error: 'Highlight not found', 
        details: { highlightId, userId, fetchError: fetchError?.message } 
      }, { status: 404 });
    }

    // Prepare request for backend content extraction service
    const extractionRequest: ContentExtractionRequest = {
      highlight_id: highlightId,
      url: highlight.url,
      highlighted_text: highlight.highlighted_text,
      page_title: highlight.title
    };

    // Call backend Firecrawl service
    console.log('Backend configuration:', {
      BACKEND_API_URL,
      BACKEND_API_KEY: process.env.BACKEND_API_KEY?.slice(0, 10) + '...',
      hasApiKey: !!process.env.BACKEND_API_KEY
    });
    
    console.log('Calling backend with request:', {
      url: `${BACKEND_API_URL}/highlights/extract-content`,
      extractionRequest: {
        ...extractionRequest,
        url: extractionRequest.url.toString()
      }
    });

    const backendResponse = await fetch(`${BACKEND_API_URL}/highlights/extract-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.BACKEND_API_KEY || 'dev-key'
      },
      body: JSON.stringify(extractionRequest)
    });

    console.log('Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend service unavailable' }));
      console.error('Backend error response:', errorData);
      
      // Extract specific error message from backend response
      let errorMessage = 'Content extraction failed';
      if (errorData.detail?.errors && Array.isArray(errorData.detail.errors)) {
        errorMessage = errorData.detail.errors.join(', ');
      } else if (errorData.detail?.message) {
        errorMessage = errorData.detail.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: errorData 
      }, { status: 500 });
    }

    const extractionResult: ContentExtractionResponse = await backendResponse.json();

    // If extraction was successful, update the highlight with the markdown content
    if (extractionResult.status === 'success' && extractionResult.markdown_content) {
      const { error: updateError } = await supabase
        .from('highlights')
        .update({
          markdown_content: extractionResult.markdown_content,
          metadata: {
            ...highlight.metadata,
            content_status: 'extracted',
            extraction_metadata: extractionResult.extraction_metadata,
            extracted_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', highlightId);

      if (updateError) {
        console.error('Failed to update highlight with extracted content:', updateError);
        return NextResponse.json({ 
          error: 'Failed to save extracted content', 
          extraction_result: extractionResult 
        }, { status: 500 });
      }
    } else {
      // Mark extraction as failed
      await supabase
        .from('highlights')
        .update({
          metadata: {
            ...highlight.metadata,
            content_status: 'failed',
            extraction_errors: extractionResult.errors,
            extracted_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', highlightId);
    }

    return NextResponse.json(extractionResult);

  } catch (error) {
    console.error('Content extraction API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}