import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse, BookmarkletResponse } from '@/types';

export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check read permissions
    const hasReadPermission = await hasPermission('read');
    if (!hasReadPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    
    // Get user's API key from user_api_keys table
    const { data: apiKeys, error } = await supabase
      .from('user_api_keys')
      .select('apiKey')
      .eq('userId', session.user.id)
      .order('createdAt', { ascending: false })
      .limit(1);

    if (error || !apiKeys || apiKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: 'API key not found. Please generate an API key first.' },
        { status: 404 }
      );
    }

    const userApiKey = apiKeys[0].apiKey;

    // Get the base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';

    // Generate bookmarklet JavaScript code using void wrapper to bypass CSP
    const jsCode = `void(function(){
var API_KEY = '${userApiKey}';
var API_URL = '${baseUrl}/api/highlights/capture';

function getSelectedText() {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.selection && document.selection.type !== 'Control') {
    return document.selection.createRange().text;
  }
  return '';
}

function showNotification(message, isError, clickableUrl) {
  var notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '12px 20px';
  notification.style.background = isError ? '#f87171' : '#10b981';
  notification.style.color = 'white';
  notification.style.borderRadius = '8px';
  notification.style.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif';
  notification.style.fontSize = '14px';
  notification.style.fontWeight = '500';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  notification.style.zIndex = '10000';
  notification.style.maxWidth = '300px';
  notification.style.wordWrap = 'break-word';
  notification.style.cursor = clickableUrl ? 'pointer' : 'default';
  
  if (clickableUrl) {
    notification.innerHTML = message + '<br><small style="text-decoration: underline; margin-top: 8px; display: block;">Click here to save highlight</small>';
    notification.onclick = function() {
      window.open(clickableUrl, '_blank');
    };
  } else {
    notification.textContent = message;
  }
  
  document.body.appendChild(notification);
  
  setTimeout(function() {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, clickableUrl ? 8000 : 4000); // Longer timeout for clickable notifications
}

function captureHighlight() {
  var selectedText = getSelectedText().trim();
  
  if (!selectedText) {
    showNotification('Please select some text to highlight', true, null);
    return;
  }
  
  if (selectedText.length > 10000) {
    showNotification('Selected text is too long (max 10,000 characters)', true, null);
    return;
  }
  
  try {
    // Use window.open with data URI to bypass CSP form-action restrictions
    var baseUrl = API_URL.replace('/api/highlights/capture', '');
    var captureUrl = baseUrl + '/capture';
    
    // Create URL with parameters (for text, url, title, key)
    var urlParams = new URLSearchParams();
    urlParams.set('text', selectedText);
    urlParams.set('url', window.location.href);
    urlParams.set('title', document.title);
    urlParams.set('key', API_KEY);
    
    var finalUrl = captureUrl + '?' + urlParams.toString();
    console.log('Opening capture URL:', finalUrl.length, 'characters');
    
    // Open capture page in new window
    var newWindow = window.open(finalUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      showNotification('Highlight capture opened in new window', false, null);
    } else {
      showNotification('Could not open capture window. Please check popup blockers.', true, null);
    }
    
  } catch (error) {
    console.error('Error capturing highlight:', error);
    showNotification('Error capturing highlight data', true, null);
  }
}

captureHighlight();
})();`;

    // Use the void wrapper technique to bypass CSP
    const bookmarkletCode = 'javascript:' + encodeURIComponent(jsCode);

    const instructions = `
To install the Post to Neemee Bookmarklet:

1. Copy the bookmarklet code above
2. Create a new bookmark in your browser
3. Set the name to "Post to Neemee"
4. Paste the code as the URL/location
5. Save the bookmark

To use:
1. Select text on any webpage
2. Click the "Post to Neemee" bookmark
3. The selected text will be saved to your Neemee account

Note: Make sure you're logged in and have a valid API key before using the bookmarklet.
    `.trim();

    const responseData: BookmarkletResponse = {
      success: true,
      bookmarklet: bookmarkletCode,
      instructions: instructions,
    };

    const response: ApiResponse = {
      success: true,
      data: responseData,
      message: 'Bookmarklet generated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating bookmarklet:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate bookmarklet',
    };
    return NextResponse.json(response, { status: 500 });
  }
}