import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/api-auth';

interface ContentExtractionRequest {
  note_id: string;
  url: string;
  content: string;
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: noteId } = await params;
  
  try {
    
    // Authenticate user
    const authContext = await getAuthContext(request);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authContext;

    // Get the note from database to verify ownership and get details
    const supabase = await createClient();
    
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !note) {
      console.error('Note lookup failed:', { fetchError, noteId, userId });
      return NextResponse.json({ 
        error: 'Note not found', 
        details: { noteId, userId, fetchError: fetchError?.message } 
      }, { status: 404 });
    }

    // Validate required fields from database
    if (!note.page_url || note.page_url.trim() === '') {
      console.error('Note missing page_url:', { 
        id: note.id, 
        page_url: note.page_url,
        has_url: !!note.page_url 
      });
      return NextResponse.json({ 
        error: 'Cannot extract content: missing page URL',
        details: 'This note was saved without a page URL. Content extraction requires the original page URL to fetch the full page content.',
        suggestion: 'You can still view and edit the note content, but full page content extraction is not available for this note.'
      }, { status: 400 });
    }

    if (!note.content || note.content.trim() === '') {
      console.error('Note missing content:', { 
        id: note.id, 
        content: note.content 
      });
      return NextResponse.json({ 
        error: 'This note is missing content and cannot be processed'
      }, { status: 400 });
    }

    // Prepare request for backend content extraction service
    const extractionRequest: ContentExtractionRequest = {
      note_id: noteId,
      url: note.page_url.trim(),
      content: note.content.trim(),
      page_title: note.page_title || undefined
    };

    // Call backend content extraction service
    console.log('Backend configuration:', {
      BACKEND_API_URL,
      BACKEND_API_KEY: process.env.BACKEND_API_KEY?.slice(0, 10) + '...',
      hasApiKey: !!process.env.BACKEND_API_KEY,
      fullBackendUrl: `${BACKEND_API_URL}/notes/extract-content`,
      allEnvVars: {
        BACKEND_API_URL: process.env.BACKEND_API_URL,
        BACKEND_API_KEY: process.env.BACKEND_API_KEY ? 'SET' : 'NOT_SET'
      }
    });
    
    console.log('Calling backend with request:', {
      backend_url: `${BACKEND_API_URL}/notes/extract-content`,
      request: extractionRequest,
      request_stringified: JSON.stringify(extractionRequest),
      note_details: {
        id: noteId,
        page_url: note.page_url,
        content: note.content?.substring(0, 100) + '...',
        page_title: note.page_title
      }
    });

    let backendResponse;
    try {
      backendResponse = await fetch(`${BACKEND_API_URL}/notes/extract-content`, {
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
        backendUrl: `${BACKEND_API_URL}/notes/extract-content`
      }, { status: 502 });
    }

    console.log('Backend response status:', backendResponse.status);
    console.log('Backend response headers:', Object.fromEntries(backendResponse.headers.entries()));

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend service unavailable' }));
      console.error('Backend error response:', errorData);
      
      // Handle 422 validation errors specifically  
      if (backendResponse.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
        const validationErrors = errorData.detail.map((err: { loc?: string[]; msg?: string; input?: unknown }) => {
          const field = err.loc ? err.loc.join('.') : 'unknown';
          return `${field}: ${err.msg}${err.input ? ` (received: ${JSON.stringify(err.input)})` : ''}`;
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
      const failureContent = `# Content Extraction Failed\n\n**Error:** ${errorMessage}\n\n**URL:** ${note.page_url}\n\n**Time:** ${new Date().toISOString()}\n\n*You can try extracting again using the "Extract Text" button.*`;
      
      try {
        const { error: updateError } = await supabase
          .from('notes')
          .update({
            markdown_content: failureContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', noteId);

        if (updateError) {
          console.error('Failed to update note with error message:', updateError);
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

    // If extraction was successful, update the note with the markdown content
    if (extractionResult.status === 'success' && extractionResult.markdown_content) {
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          markdown_content: extractionResult.markdown_content,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (updateError) {
        console.error('Failed to update note with extracted content:', updateError);
        return NextResponse.json({ 
          error: 'Failed to save extracted content', 
          extraction_result: extractionResult 
        }, { status: 500 });
      }
    } else {
      // If extraction failed, save the error message as the content
      const errorMessage = extractionResult.errors?.join('\n') || 'Content extraction failed';
      const failureContent = `# Content Extraction Failed\n\n**Error:** ${errorMessage}\n\n**URL:** ${note.page_url}\n\n**Time:** ${new Date().toISOString()}\n\n*You can try extracting again using the "Extract Text" button.*`;
      
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          markdown_content: failureContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (updateError) {
        console.error('Failed to update note with error message:', updateError);
      }
    }

    return NextResponse.json(extractionResult);

  } catch (error) {
    console.error('Content extraction API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Try to save the error message as content if we have note info
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during extraction';
      const failureContent = `# Content Extraction Failed\n\n**Error:** ${errorMessage}\n\n**URL:** ${noteId ? 'Available in note details' : 'Unknown'}\n\n**Time:** ${new Date().toISOString()}\n\n*You can try extracting again using the "Extract Text" button.*`;
      
      if (noteId) {
        const supabase = await createClient();
        await supabase
          .from('notes')
          .update({
            markdown_content: failureContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', noteId);
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