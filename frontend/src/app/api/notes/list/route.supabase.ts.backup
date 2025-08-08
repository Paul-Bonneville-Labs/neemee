import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse, NotesLibraryResponse } from '@/types';

export async function GET(request: NextRequest) {
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

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search')?.trim();
    const domain = searchParams.get('domain')?.trim();
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    const offset = (page - 1) * limit;

    // Build query - select using new field names
    let query = supabase
      .from('notes')
      .select(`
        id,
        user_id,
        content,
        snippet,
        page_url,
        page_title,
        markdown_content,
        metadata,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters using new field names
    if (search) {
      query = query.or(`content.ilike.%${search}%,page_title.ilike.%${search}%,snippet.ilike.%${search}%`);
    }

    if (domain) {
      query = query.like('page_url', `%${domain}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: notes, error, count } = await query;

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    // No transformation needed as database fields now match interface
    const responseData: NotesLibraryResponse = {
      notes: notes || [],
      pagination: {
        total: count || 0,
        page,
        limit
      }
    };

    const response: ApiResponse = {
      success: true,
      data: responseData,
      message: `Found ${notes?.length || 0} notes`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing notes:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list notes',
    };
    return NextResponse.json(response, { status: 500 });
  }
}