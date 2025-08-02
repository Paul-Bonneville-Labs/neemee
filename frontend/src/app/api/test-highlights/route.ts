import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get first few highlights to test with
    const { data: highlights, error } = await supabase
      .from('highlights')
      .select('id, url, highlighted_text, title, user_id')
      .limit(5);
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
        details: error
      });
    }
    
    return NextResponse.json({
      status: 'success',
      highlights: highlights || [],
      count: highlights?.length || 0
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    });
  }
}