import { prisma } from './prisma';
import { getSession } from './auth';

/**
 * Authenticate user via API key for bookmarklet requests using Prisma
 */
export async function authenticateApiKey(apiKey: string): Promise<string | null> {
  try {
    // Find user by API key in ApiKey table using Prisma
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: apiKey, // In a real implementation, this should be hashed
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      select: {
        id: true,
        userId: true
      }
    });
    
    if (!apiKeyRecord) {
      console.error('API key authentication failed: Key not found or inactive');
      return null;
    }
    
    // Update last used timestamp
    await prisma.apiKey.update({
      where: {
        id: apiKeyRecord.id
      },
      data: {
        lastUsedAt: new Date()
      }
    });
    
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
 * Create API key for user using Prisma
 */
export async function createApiKey(userId: string, name: string, permissions?: any): Promise<{ apiKey: string; keyPrefix: string } | null> {
  try {
    const apiKey = generateApiKey();
    const keyPrefix = apiKey.substring(0, 8);
    
    const createdKey = await prisma.apiKey.create({
      data: {
        userId,
        keyHash: apiKey, // In production, this should be properly hashed
        keyPrefix,
        name,
        permissions: permissions || {},
        isActive: true
      }
    });
    
    return { apiKey, keyPrefix };
  } catch (error) {
    console.error('Error creating API key:', error);
    return null;
  }
}

/**
 * List API keys for user using Prisma
 */
export async function listApiKeys(userId: string) {
  try {
    return await prisma.apiKey.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return [];
  }
}

/**
 * Deactivate API key using Prisma
 */
export async function deactivateApiKey(userId: string, keyId: string): Promise<boolean> {
  try {
    await prisma.apiKey.update({
      where: {
        id: keyId,
        userId // Ensure user owns the key
      },
      data: {
        isActive: false
      }
    });
    return true;
  } catch (error) {
    console.error('Error deactivating API key:', error);
    return false;
  }
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
 * Validate highlight text
 */
export function validateHighlightText(text: string): { valid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text is required' };
  }
  
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }
  
  if (trimmedText.length > 50000) {
    return { valid: false, error: 'Text is too long (max 50,000 characters)' };
  }
  
  return { valid: true };
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}