import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment_check: {
      BACKEND_API_URL: process.env.BACKEND_API_URL || 'NOT_SET',
      BACKEND_API_KEY: process.env.BACKEND_API_KEY ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
    },
    backend_test: await testBackendConnection()
  });
}

async function testBackendConnection() {
  const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${BACKEND_API_URL}/health`, {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.BACKEND_API_KEY || 'dev-key'
      }
    });
    
    const data = await response.json();
    return {
      status: 'success',
      backend_url: `${BACKEND_API_URL}/health`,
      response_status: response.status,
      data: data
    };
  } catch (error) {
    return {
      status: 'error',
      backend_url: `${BACKEND_API_URL}/health`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}