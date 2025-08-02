import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test extraction API called');
    
    return NextResponse.json({ 
      message: 'Test extraction API is working',
      timestamp: new Date().toISOString(),
      env: {
        hasBackendUrl: !!process.env.BACKEND_API_URL,
        hasBackendKey: !!process.env.BACKEND_API_KEY,
        backendUrl: process.env.BACKEND_API_URL || 'not set'
      }
    });
  } catch (error) {
    console.error('Test extraction API error:', error);
    return NextResponse.json({ 
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}