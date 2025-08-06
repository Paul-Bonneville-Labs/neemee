import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get first few notes to test with
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, page_url, content, page_title, user_id')
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
      notes: notes || [],
      count: notes?.length || 0
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    });
  }
}