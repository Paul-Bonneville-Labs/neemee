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
    
    // Create a test note
    const testNote = {
      user_id: userId,
      page_url: 'https://example.com',
      content: 'This domain is for use in illustrative examples in documents.',
      snippet: 'This domain is for use in illustrative examples in documents.',
      page_title: 'Example Domain',
      metadata: {
        content_status: 'pending'
      }
    };
    
    const { data: note, error } = await supabase
      .from('notes')
      .insert(testNote)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create test note:', error);
      return NextResponse.json({
        error: 'Failed to create test note',
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      note: note,
      message: 'Test note created successfully'
    });
  } catch (error) {
    console.error('Create test note error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}