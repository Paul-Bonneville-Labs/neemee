import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authContext = await getAuthContext(request);
    console.log('Auth context:', authContext ? { userId: authContext.userId } : 'null');
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authContext;

    const supabase = await createClient();
    
    // Create a test highlight
    const testHighlight = {
      user_id: userId,
      url: 'https://example.com',
      page_url: 'https://example.com',
      highlighted_text: 'This domain is for use in illustrative examples in documents.',
      title: 'Example Domain',
      page_title: 'Example Domain',
      metadata: {
        content_status: 'pending'
      }
    };
    
    const { data: highlight, error } = await supabase
      .from('highlights')
      .insert(testHighlight)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create test highlight:', error);
      return NextResponse.json({
        error: 'Failed to create test highlight',
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      highlight: highlight,
      message: 'Test highlight created successfully'
    });
  } catch (error) {
    console.error('Create test highlight error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}