import { prisma } from './prisma';
import { auth } from '@/auth';
import crypto from 'crypto';

/**
 * Authenticate user via API key for bookmarklet requests
 */
export async function authenticateApiKey(apiKey: string): Promise<string | null> {
  try {
    // Hash the provided API key to compare with stored hash
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Find API key with matching hash
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: hashedKey,
        isActive: true
      },
      select: {
        userId: true,
        keyPrefix: true
      }
    });
    
    if (apiKeyRecord) {
      // Update last used timestamp
      await prisma.apiKey.updateMany({
        where: {
          keyHash: hashedKey,
          isActive: true
        },
        data: {
          lastUsedAt: new Date()
        }
      });
    }
    
    return apiKeyRecord?.userId || null;
  } catch (error) {
    console.error('API key authentication error:', error);
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
 * Build search filters for Prisma note queries
 */
export function buildNoteSearchFilters(params: {
  userId: string;
  search?: string;
  domain?: string;
  startDate?: string;
  endDate?: string;
}): { [key: string]: unknown } {
  const { userId, search, domain, startDate, endDate } = params;
  
  const where: { [key: string]: unknown } = {
    userId
  };

  // Add search filter
  if (search) {
    where.OR = [
      { content: { contains: search, mode: 'insensitive' } },
      { pageTitle: { contains: search, mode: 'insensitive' } },
      { snippet: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Add domain filter
  if (domain) {
    where.pageUrl = { contains: domain };
  }

  // Add date filters
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      (where.createdAt as { [key: string]: unknown }).gte = new Date(startDate);
    }
    if (endDate) {
      (where.createdAt as { [key: string]: unknown }).lte = new Date(endDate);
    }
  }

  return where;
}

/**
 * Get authentication context from request - either session or API key
 */
export async function getAuthContext(request: Request): Promise<{ userId: string; authType: 'session' | 'api_key' } | null> {
  // First try session authentication
  try {
    const session = await auth();
    if (session?.user?.id) {
      return {
        userId: session.user.id,
        authType: 'session'
      };
    }
  } catch {
    // Session auth failed, continue to API key
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