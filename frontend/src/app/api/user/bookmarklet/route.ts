import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse, BookmarkletResponse } from '@/types';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has an active API key (needed for the capture endpoint)
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      }
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { success: false, error: 'No active API key found. Please generate an API key first.' },
        { status: 404 }
      );
    }

    // Get the base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Generate bookmarklet JavaScript code that redirects to capture page
    const jsCode = `void(function(){
var CAPTURE_URL = '${baseUrl}/capture';

function getSelectedText() {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.selection && document.selection.type !== 'Control') {
    return document.selection.createRange().text;
  }
  return '';
}

function showNotification(message, isError) {
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
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(function() {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 4000);
}

function captureHighlight() {
  var selectedText = getSelectedText().trim();
  
  if (!selectedText) {
    showNotification('Please select some text to highlight', true);
    return;
  }
  
  if (selectedText.length > 10000) {
    showNotification('Selected text is too long (max 10,000 characters)', true);
    return;
  }
  
  try {
    // Create URL with parameters for the capture page
    var urlParams = new URLSearchParams();
    urlParams.set('text', selectedText);
    urlParams.set('url', window.location.href);
    urlParams.set('title', document.title);
    
    var finalUrl = CAPTURE_URL + '?' + urlParams.toString();
    
    // Open capture page in new window/tab
    var newWindow = window.open(finalUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      showNotification('Opening capture window...', false);
    } else {
      showNotification('Could not open capture window. Please check popup blockers.', true);
    }
    
  } catch (error) {
    console.error('Error capturing highlight:', error);
    showNotification('Error capturing highlight data', true);
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

The bookmarklet code above already contains your personal API key and is ready to use!
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