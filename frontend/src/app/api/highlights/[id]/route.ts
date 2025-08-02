import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid highlight ID parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid highlight ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get highlight with user authorization check
    const { data: highlight, error } = await supabase
      .from('highlights')
      .select(`
        id,
        user_id,
        highlighted_text,
        original_quote,
        url,
        title,
        markdown_content,
        created_at
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Highlight not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching highlight:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch highlight' },
        { status: 500 }
      );
    }

    // Transform database fields to match TypeScript interface
    const transformedHighlight = {
      id: highlight.id,
      user_id: highlight.user_id,
      highlighted_text: highlight.highlighted_text,
      original_quote: highlight.original_quote,
      page_url: highlight.url, // Map database 'url' to interface 'page_url'
      page_title: highlight.title, // Map database 'title' to interface 'page_title'
      markdown_content: highlight.markdown_content,
      created_at: highlight.created_at
    };

    const response: ApiResponse = {
      success: true,
      data: transformedHighlight,
      message: `Retrieved highlight ${id}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting highlight:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get highlight',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid highlight ID parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid highlight ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { highlighted_text, page_title, page_url } = body;

    // Validate required fields
    if (!highlighted_text || typeof highlighted_text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'highlighted_text is required and must be a string' },
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
    const sanitizedText = highlighted_text.trim();
    const sanitizedTitle = page_title?.trim() || null;
    const sanitizedUrl = page_url?.trim();

    // Validate lengths
    if (sanitizedText.length === 0) {
      return NextResponse.json(
        { success: false, error: 'highlighted_text cannot be empty' },
        { status: 400 }
      );
    }

    if (sanitizedText.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'highlighted_text is too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    if (sanitizedTitle && sanitizedTitle.length > 500) {
      return NextResponse.json(
        { success: false, error: 'page_title is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Build update object (map interface fields to database fields)
    const updateData: any = {
      highlighted_text: sanitizedText,
    };

    if (sanitizedTitle !== undefined) {
      updateData.title = sanitizedTitle; // Map 'page_title' to 'title'
    }

    if (sanitizedUrl !== undefined) {
      updateData.url = sanitizedUrl; // Map 'page_url' to 'url'
      
      // Update domain if URL changed
      try {
        updateData.domain = new URL(sanitizedUrl).hostname;
      } catch {
        // Keep existing domain if URL is invalid
      }
    }

    // Update highlight with user authorization check
    const { data: highlight, error } = await supabase
      .from('highlights')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select(`
        id,
        user_id,
        highlighted_text,
        original_quote,
        url,
        title,
        markdown_content,
        created_at
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Highlight not found or access denied' },
          { status: 404 }
        );
      }
      console.error('Error updating highlight:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update highlight' },
        { status: 500 }
      );
    }

    // Transform database fields to match TypeScript interface
    const transformedHighlight = {
      id: highlight.id,
      user_id: highlight.user_id,
      highlighted_text: highlight.highlighted_text,
      original_quote: highlight.original_quote,
      page_url: highlight.url, // Map database 'url' to interface 'page_url'
      page_title: highlight.title, // Map database 'title' to interface 'page_title'
      markdown_content: highlight.markdown_content,
      created_at: highlight.created_at
    };

    const response: ApiResponse = {
      success: true,
      data: transformedHighlight,
      message: `Highlight ${id} updated successfully`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating highlight:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update highlight',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    
    // Validate ID parameter
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid highlight ID parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid highlight ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Delete highlight with user authorization check
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting highlight:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete highlight' },
        { status: 500 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: `Highlight ${id} deleted successfully`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting highlight:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete highlight',
    };
    return NextResponse.json(response, { status: 500 });
  }
}