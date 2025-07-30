import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Test session endpoint - Session:', session ? 'exists' : 'null');
    console.log('Test session endpoint - Cookies:', request.cookies.toString());
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      user: session?.user || null,
      cookies: request.cookies.toString()
    });
  } catch (error) {
    console.error('Error in test session:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}