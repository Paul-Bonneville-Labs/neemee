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
  markdown_content?: string;
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

    // Validate required fields from database
    if (!highlight.url || highlight.url.trim() === '') {
      console.error('Highlight missing url:', { 
        id: highlight.id, 
        url: highlight.url,
        has_url: !!highlight.url 
      });
      return NextResponse.json({ 
        error: 'Cannot extract content: missing page URL',
        details: 'This highlight was saved without a page URL. This may be from an older version of the system. Content extraction requires the original page URL to fetch the full page content.',
        suggestion: 'You can still view and edit the highlighted text, but full page content extraction is not available for this highlight.'
      }, { status: 400 });
    }

    if (!highlight.highlighted_text || highlight.highlighted_text.trim() === '') {
      console.error('Highlight missing highlighted_text:', { 
        id: highlight.id, 
        highlighted_text: highlight.highlighted_text 
      });
      return NextResponse.json({ 
        error: 'This highlight is missing the highlighted text and cannot be processed'
      }, { status: 400 });
    }

    // Prepare request for backend content extraction service
    const extractionRequest: ContentExtractionRequest = {
      highlight_id: highlightId,
      url: highlight.url.trim(),
      highlighted_text: highlight.highlighted_text.trim(),
      page_title: highlight.title || undefined
    };

    // Call backend Firecrawl service
    console.log('Backend configuration:', {
      BACKEND_API_URL,
      BACKEND_API_KEY: process.env.BACKEND_API_KEY?.slice(0, 10) + '...',
      hasApiKey: !!process.env.BACKEND_API_KEY,
      fullBackendUrl: `${BACKEND_API_URL}/highlights/extract-content`,
      allEnvVars: {
        BACKEND_API_URL: process.env.BACKEND_API_URL,
        BACKEND_API_KEY: process.env.BACKEND_API_KEY ? 'SET' : 'NOT_SET'
      }
    });
    
    console.log('Calling backend with request:', {
      backend_url: `${BACKEND_API_URL}/highlights/extract-content`,
      request: extractionRequest,
      request_stringified: JSON.stringify(extractionRequest),
      highlight_details: {
        id: highlightId,
        url: highlight.url,
        highlighted_text: highlight.highlighted_text?.substring(0, 100) + '...',
        title: highlight.title
      }
    });

    let backendResponse;
    try {
      backendResponse = await fetch(`${BACKEND_API_URL}/highlights/extract-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.BACKEND_API_KEY || 'dev-key'
        },
        body: JSON.stringify(extractionRequest)
      });
    } catch (fetchError) {
      console.error('Failed to connect to backend service:', fetchError);
      return NextResponse.json({ 
        error: 'Backend service unavailable',
        details: fetchError instanceof Error ? fetchError.message : 'Connection failed',
        backendUrl: `${BACKEND_API_URL}/highlights/extract-content`
      }, { status: 502 });
    }

    console.log('Backend response status:', backendResponse.status);
    console.log('Backend response headers:', Object.fromEntries(backendResponse.headers.entries()));

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend service unavailable' }));
      console.error('Backend error response:', errorData);
      
      // Handle 422 validation errors specifically  
      if (backendResponse.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
        const validationErrors = errorData.detail.map((err: any) => {
          const field = err.loc ? err.loc.join('.') : 'unknown';
          return `${field}: ${err.msg} (received: ${JSON.stringify(err.input)})`;
        });
        console.error('Validation errors:', validationErrors);
        console.error('Sent request:', extractionRequest);
        
        return NextResponse.json({ 
          error: `Request validation failed: ${validationErrors.join(', ')}`,
          details: errorData,
          sentRequest: extractionRequest
        }, { status: 422 });
      }
      
      // Extract specific error message from backend response
      console.log('Extracting error message from:', errorData);
      
      let errorMessage = 'Content extraction failed';
      
      // Try to extract the most detailed error information available
      if (errorData.detail?.errors && Array.isArray(errorData.detail.errors)) {
        // Extract the actual Firecrawl error messages from the errors array
        // These should already be formatted as "HTTP 403 - Error message"
        errorMessage = errorData.detail.errors.join(' - ');
        console.log('Using detail.errors:', errorMessage);
      } else if (errorData.detail?.message) {
        errorMessage = errorData.detail.message;
        console.log('Using detail.message:', errorMessage);
      } else if (errorData.detail && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
        console.log('Using detail as string:', errorMessage);
      } else if (errorData.error) {
        errorMessage = errorData.error;
        console.log('Using error:', errorMessage);
      } else if (errorData.message) {
        errorMessage = errorData.message;
        console.log('Using message:', errorMessage);
      }
      
      // Log the full error structure for debugging
      console.log('Full errorData structure for debugging:', JSON.stringify(errorData, null, 2));
      
      // Save the error message as content before returning error response
      const failureContent = `# Content Extraction Failed\n\n**Error:** ${errorMessage}\n\n**URL:** ${highlight.url}\n\n**Time:** ${new Date().toISOString()}\n\n*You can try extracting again using the "Extract Text" button.*`;
      
      try {
        const { error: updateError } = await supabase
          .from('highlights')
          .update({
            markdown_content: failureContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', highlightId);

        if (updateError) {
          console.error('Failed to update highlight with error message:', updateError);
        } else {
          console.log('Successfully saved error message to database as content');
        }
      } catch (saveError) {
        console.error('Error saving failure content to database:', saveError);
      }
      
      const finalResponse = { 
        error: errorMessage,
        details: errorData
      };
      console.log('Returning error response:', finalResponse);
      return NextResponse.json(finalResponse, { status: 500 });
    }

    const extractionResult: ContentExtractionResponse = await backendResponse.json();
    console.log('Backend extraction result:', extractionResult);

    // If extraction was successful, update the highlight with the markdown content
    if (extractionResult.status === 'success' && extractionResult.markdown_content) {
      const { error: updateError } = await supabase
        .from('highlights')
        .update({
          markdown_content: extractionResult.markdown_content,
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
      // If extraction failed, save the error message as the content
      const errorMessage = extractionResult.errors?.join('\n') || 'Content extraction failed';
      const failureContent = `# Content Extraction Failed\n\n**Error:** ${errorMessage}\n\n**URL:** ${highlight.url}\n\n**Time:** ${new Date().toISOString()}\n\n*You can try extracting again using the "Extract Text" button.*`;
      
      const { error: updateError } = await supabase
        .from('highlights')
        .update({
          markdown_content: failureContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', highlightId);

      if (updateError) {
        console.error('Failed to update highlight with error message:', updateError);
      }
    }

    console.log('Returning final result:', extractionResult);
    return NextResponse.json(extractionResult);

  } catch (error) {
    console.error('Content extraction API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Try to save the error message as content if we have highlight info
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during extraction';
      const failureContent = `# Content Extraction Failed\n\n**Error:** ${errorMessage}\n\n**URL:** ${highlightId ? 'Available in highlight details' : 'Unknown'}\n\n**Time:** ${new Date().toISOString()}\n\n*You can try extracting again using the "Extract Text" button.*`;
      
      if (highlightId) {
        const supabase = await createClient();
        await supabase
          .from('highlights')
          .update({
            markdown_content: failureContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', highlightId);
      }
    } catch (saveError) {
      console.error('Failed to save error message as content:', saveError);
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}