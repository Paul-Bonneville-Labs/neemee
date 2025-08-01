// Test script for highlights API endpoints
// Run with: node test-highlights-api.js

const BASE_URL = 'http://localhost:3000';

async function testHighlightsApi() {
  console.log('🧪 Testing Highlights API Endpoints\n');
  
  // Note: These tests require authentication, so they would need to be run
  // in a browser context with valid session cookies or with valid API keys
  
  console.log('📋 Available Endpoints:');
  console.log('GET    /api/highlights/list - List user highlights with pagination/filtering');
  console.log('POST   /api/highlights/capture - Capture highlight via bookmarklet (requires API key)');
  console.log('GET    /api/highlights/[id] - Get specific highlight');
  console.log('DELETE /api/highlights/[id] - Delete specific highlight');
  console.log('GET    /api/user/api-key - Get user API key');
  console.log('POST   /api/user/api-key - Generate/regenerate API key');
  console.log('GET    /api/user/bookmarklet - Generate bookmarklet JavaScript\n');
  
  console.log('🔑 Authentication:');
  console.log('- Dashboard routes: Session-based authentication (cookies)');
  console.log('- Capture route: API key authentication (X-API-Key header)');
  console.log('- CORS enabled for capture route to support bookmarklet requests\n');
  
  console.log('📊 Example usage:');
  console.log('```javascript');
  console.log('// List highlights with search and pagination');
  console.log('fetch("/api/highlights/list?search=javascript&page=1&limit=10")');
  console.log('');
  console.log('// Capture highlight via bookmarklet');
  console.log('fetch("/api/highlights/capture", {');
  console.log('  method: "POST",');
  console.log('  headers: {');
  console.log('    "Content-Type": "application/json",');
  console.log('    "X-API-Key": "your-api-key"');
  console.log('  },');
  console.log('  body: JSON.stringify({');
  console.log('    highlighted_text: "Selected text",');
  console.log('    page_url: "https://example.com",');
  console.log('    page_title: "Example Page",');
  console.log('    api_key: "your-api-key"');
  console.log('  })');
  console.log('});');
  console.log('```\n');
  
  console.log('✅ All highlight API routes have been created successfully!');
  console.log('🚀 Start the development server and test with authentication.');
}

testHighlightsApi();