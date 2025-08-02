import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse, HighlightListResponse } from '@/types';

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

    // Build query - select and map fields to match interface
    let query = supabase
      .from('highlights')
      .select(`
        id,
        user_id,
        highlighted_text,
        original_quote,
        url,
        title,
        metadata,
        created_at
      `, { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters using correct database field names
    if (search) {
      query = query.or(`highlighted_text.ilike.%${search}%,title.ilike.%${search}%`);
    }

    if (domain) {
      query = query.like('url', `%${domain}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: highlights, error, count } = await query;

    if (error) {
      console.error('Error fetching highlights:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch highlights' },
        { status: 500 }
      );
    }

    // Transform database fields to match TypeScript interface
    const transformedHighlights = (highlights || []).map(highlight => ({
      id: highlight.id,
      user_id: highlight.user_id,
      highlighted_text: highlight.highlighted_text,
      original_quote: highlight.original_quote,
      page_url: highlight.url, // Map database 'url' to interface 'page_url'
      page_title: highlight.title, // Map database 'title' to interface 'page_title'
      metadata: highlight.metadata, // Include full metadata with opengraph_data
      created_at: highlight.created_at
    }));

    const responseData: HighlightListResponse = {
      highlights: transformedHighlights,
      pagination: {
        total: count || 0,
        page,
        limit
      }
    };

    const response: ApiResponse = {
      success: true,
      data: responseData,
      message: `Found ${highlights?.length || 0} highlights`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing highlights:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list highlights',
    };
    return NextResponse.json(response, { status: 500 });
  }
}