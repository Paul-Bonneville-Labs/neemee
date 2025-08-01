import { createClient } from './supabase/server';
import { getSession } from './auth';

/**
 * Authenticate user via API key for bookmarklet requests
 */
export async function authenticateApiKey(apiKey: string): Promise<string | null> {
  try {
    console.log('Authenticating API key:', apiKey?.substring(0, 8) + '...');
    const supabase = await createClient();
    
    // Find user by API key in user_api_keys table
    const { data: apiKeyRecord, error } = await supabase
      .from('user_api_keys')
      .select('userId')
      .eq('apiKey', apiKey)
      .single();
    
    console.log('API key lookup result:', { 
      found: !!apiKeyRecord, 
      error: error?.message || error?.code,
      apiKeyRecord: apiKeyRecord ? { userId: apiKeyRecord.userId } : null 
    });
    
    if (error || !apiKeyRecord) {
      console.error('API key authentication failed:', error);
      return null;
    }
    
    return apiKeyRecord.userId;
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return null;
  }
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and javascript: protocols
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .substring(0, 50000); // Limit HTML size
}

/**
 * Validate highlight text
 */
export function validateHighlightText(text: string): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Highlight text is required' };
  }
  
  if (text.trim().length === 0) {
    return { valid: false, error: 'Highlight text cannot be empty' };
  }
  
  if (text.length > 10000) {
    return { valid: false, error: 'Highlight text too long (max 10,000 characters)' };
  }
  
  return { valid: true };
}

/**
 * Get authentication context from request - either session or API key
 */
export async function getAuthContext(request: Request): Promise<{ userId: string; authType: 'session' | 'api_key' } | null> {
  // First try session authentication
  try {
    const session = await getSession();
    if (session?.user?.id) {
      return {
        userId: session.user.id,
        authType: 'session'
      };
    }
  } catch (error) {
    console.log('Session auth failed, trying API key auth');
  }
  
  // Try API key authentication
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (apiKey) {
    const userId = await authenticateApiKey(apiKey);
    if (userId) {
      return {
        userId,
        authType: 'api_key'
      };
    }
  }
  
  return null;
}