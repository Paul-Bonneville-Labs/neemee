import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for temporary HTML (in production, use Redis or database)
const tempHtmlStorage = new Map<string, { html: string; timestamp: number }>();

// Clean up old entries every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, data] of tempHtmlStorage.entries()) {
    if (data.timestamp < oneHourAgo) {
      tempHtmlStorage.delete(key);
    }
  }
}, 60 * 60 * 1000);

export async function POST(request: NextRequest) {
  console.log('API capture POST handler called');
  
  try {
    console.log('Parsing form data...');
    // Parse form data from the POST request
    const formData = await request.formData();
    
    const text = formData.get('text') as string;
    const url = formData.get('url') as string;
    const title = formData.get('title') as string;
    const apiKey = formData.get('key') as string;
    const html = formData.get('html') as string;

    console.log('POST capture received:', {
      text: text ? `${text.length} characters` : 'null',
      url: url,
      title: title,
      apiKey: apiKey ? 'present' : 'null',
      html: html ? `${html.length} characters` : 'null'
    });

    if (!text || !url || !apiKey) {
      return NextResponse.redirect(
        new URL(`/capture?error=missing_data`, request.url)
      );
    }

    // Store HTML temporarily if provided
    let htmlKey = '';
    if (html && html.length > 0) {
      htmlKey = 'temp_html_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      tempHtmlStorage.set(htmlKey, { html, timestamp: Date.now() });
      console.log('Stored HTML temporarily with key:', htmlKey, html.length, 'characters');
    }

    // Redirect to the capture page with data as URL parameters
    const captureUrl = new URL('/capture', request.url);
    captureUrl.searchParams.set('text', text);
    captureUrl.searchParams.set('url', url);
    captureUrl.searchParams.set('title', title || '');
    captureUrl.searchParams.set('key', apiKey);
    
    if (htmlKey) {
      captureUrl.searchParams.set('htmlKey', htmlKey);
    }

    return NextResponse.redirect(captureUrl);
  } catch (error) {
    console.error('Error processing POST capture:', error);
    return NextResponse.redirect(
      new URL(`/capture?error=processing_error`, request.url)
    );
  }
}

// Handle GET requests for HTML retrieval
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const htmlKey = url.searchParams.get('getHtml');
  
  if (htmlKey && tempHtmlStorage.has(htmlKey)) {
    const data = tempHtmlStorage.get(htmlKey)!;
    tempHtmlStorage.delete(htmlKey); // Clean up after retrieval
    
    return NextResponse.json({ 
      success: true, 
      html: data.html,
      length: data.html.length 
    });
  }
  
  return NextResponse.json({ success: false, error: 'HTML not found' });
}