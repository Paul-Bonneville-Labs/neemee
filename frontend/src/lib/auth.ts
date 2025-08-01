import { createClient } from './supabase/server';

export interface UserPermissions {
  read: boolean;
  write: boolean;
  admin: boolean;
  delete: boolean;
}

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  role?: string;
  permissions?: UserPermissions;
}

export interface AuthSession {
  user: AuthUser;
  expires?: string;
}

/**
 * Get current user session from Supabase
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Map Supabase user to our AuthUser format
    const authUser: AuthUser = {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      email: user.email || null,
      image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || null,
      role: 'reader', // Default role, can be enhanced later
      permissions: {
        read: true,
        write: true, // Enable write permissions for highlight management
        admin: false,
        delete: true // Enable delete permissions for highlight management
      }
    };

    return {
      user: authUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get current user from Supabase
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: keyof UserPermissions): Promise<boolean> {
  const session = await getSession();
  return session?.user?.permissions?.[permission] || false;
}

/**
 * Map GitHub repository permission to application role
 * This can be used later when we integrate GitHub permissions with Supabase profiles
 */
export function mapGitHubPermissionToRole(permission: string): string {
  switch (permission) {
    case 'admin':
      return 'owner';
    case 'maintain':
      return 'maintainer';
    case 'write':
    case 'push':
      return 'contributor';
    case 'read':
    case 'pull':
    default:
      return 'reader';
  }
}

/**
 * Map GitHub repository permission to application permissions
 * This can be used later when we integrate GitHub permissions with Supabase profiles
 */
export function mapGitHubPermissionToPermissions(permission: string): UserPermissions {
  switch (permission) {
    case 'admin':
      return { read: true, write: true, admin: true, delete: true };
    case 'maintain':
      return { read: true, write: true, admin: false, delete: false };
    case 'write':
    case 'push':
      return { read: true, write: true, admin: false, delete: false };
    case 'read':
    case 'pull':
    default:
      return { read: true, write: false, admin: false, delete: false };
  }
}