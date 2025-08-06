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
        { success: false, error: 'Invalid note ID parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get note with user authorization check
    const { data: note, error } = await supabase
      .from('notes')
      .select(`
        id,
        user_id,
        content,
        snippet,
        page_url,
        page_title,
        markdown_content,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Note not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching note:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch note' },
        { status: 500 }
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
        { success: false, error: 'Invalid note ID parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
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

    const supabase = await createClient();
    
    // Build update object
    const updateData: Record<string, unknown> = {
      content: sanitizedContent,
      updated_at: new Date().toISOString()
    };

    if (sanitizedTitle !== undefined) {
      updateData.page_title = sanitizedTitle;
    }

    if (sanitizedUrl !== undefined) {
      updateData.page_url = sanitizedUrl;
      
      // Update domain if URL changed
      try {
        updateData.domain = new URL(sanitizedUrl).hostname;
      } catch {
        // Keep existing domain if URL is invalid
      }
    }

    // Update note with user authorization check
    const { data: note, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select(`
        id,
        user_id,
        content,
        snippet,
        page_url,
        page_title,
        markdown_content,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Note not found or access denied' },
          { status: 404 }
        );
      }
      console.error('Error updating note:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update note' },
        { status: 500 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: note,
      message: `Note ${id} updated successfully`,
    };

    return NextResponse.json(response);
  } catch (error) {
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
        { success: false, error: 'Invalid note ID parameter' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Delete note with user authorization check
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete note' },
        { status: 500 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: `Note ${id} deleted successfully`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting note:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete note',
    };
    return NextResponse.json(response, { status: 500 });
  }
}