import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test database connection
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.error('Database error:', profilesError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: profilesError.message 
      }, { status: 500 });
    }
    
    // Test auth connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    return NextResponse.json({ 
      success: true,
      database: 'connected',
      auth: user ? 'authenticated' : 'not authenticated',
      profilesTable: 'accessible',
      profileCount: profiles?.length || 0
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}