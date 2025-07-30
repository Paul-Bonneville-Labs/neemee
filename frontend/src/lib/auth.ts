import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { githubClient } from './github';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Check if user has access to the configured repository
      if (account?.provider === 'github' && profile?.login) {
        try {
          await githubClient.getUserPermissions(profile.login as string);
          return true;
        } catch (error) {
          console.error('Repository access check failed:', error);
          return false;
        }
      }
      return false;
    },
    async session({ session, token }) {
      // Add GitHub username and role to session
      if (token.login && session.user) {
        session.user.username = token.login as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as {
          read: boolean;
          write: boolean;
          admin: boolean;
          delete: boolean;
        };
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Store GitHub info in JWT token
      if (account && profile) {
        token.login = profile.login;
        
        // Get user permissions for role mapping
        try {
          const permissions = await githubClient.getUserPermissions(profile.login as string);
          token.role = mapGitHubPermissionToRole(permissions.permission);
          token.permissions = mapGitHubPermissionToPermissions(permissions.permission);
        } catch (error) {
          console.error('Failed to get user permissions:', error);
          token.role = 'reader';
          token.permissions = { read: true, write: false, admin: false, delete: false };
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Map GitHub repository permission to application role
 */
function mapGitHubPermissionToRole(permission: string): string {
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
 */
function mapGitHubPermissionToPermissions(permission: string) {
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

/**
 * Type augmentation for NextAuth session
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      role?: string;
      permissions?: {
        read: boolean;
        write: boolean;
        admin: boolean;
        delete: boolean;
      };
    };
  }

  interface Profile {
    login?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    login?: string;
    role?: string;
    permissions?: {
      read: boolean;
      write: boolean;
      admin: boolean;
      delete: boolean;
    };
  }
}