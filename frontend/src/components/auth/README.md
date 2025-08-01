# Authentication Components

This directory contains comprehensive authentication UI components for Supabase auth integration with support for multiple authentication methods.

## Components Overview

### Core Components

- **`Auth.tsx`** - Main unified authentication interface with tabbed design
- **`AuthModal.tsx`** - Modal wrapper for the Auth component
- **`AuthProvider.tsx`** - Enhanced context provider with all auth methods
- **`ProfileMenu.tsx`** - User profile dropdown with account management
- **`AuthStatus.tsx`** - Authentication status indicators

### Auth Method Components

- **`EmailPasswordAuth.tsx`** - Email/password signin and signup with validation
- **`MagicLinkAuth.tsx`** - Passwordless email authentication
- **`SocialAuth.tsx`** - Google and GitHub OAuth authentication
- **`AnonymousAuth.tsx`** - Anonymous session management

## Usage Examples

### Basic Setup

```tsx
// In your app layout or root component
import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Using the Auth Modal

```tsx
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/components/AuthProvider';

export function LoginButton() {
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();

  if (user) return null;

  return (
    <>
      <button onClick={() => setShowAuth(true)}>
        Sign In
      </button>
      
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="anonymous" // or 'email', 'magic_link', 'social'
      />
    </>
  );
}
```

### Using the Profile Menu

```tsx
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { useAuth } from '@/components/AuthProvider';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      {user && <ProfileMenu />}
    </header>
  );
}
```

### Using Auth Status Indicators

```tsx
import { AuthStatus, AuthStatusBadge, ConnectionStatus } from '@/components/auth/AuthStatus';

export function StatusBar() {
  return (
    <div className="flex items-center gap-4">
      <AuthStatus />
      <AuthStatusBadge />
      <ConnectionStatus />
    </div>
  );
}
```

### Individual Auth Components

```tsx
import { Auth } from '@/components/Auth';

// Use specific tab
export function QuickSignIn() {
  return (
    <Auth 
      defaultTab="anonymous"
      title="Quick Start"
      subtitle="Get started immediately"
      onClose={() => console.log('Auth completed')}
    />
  );
}

// Use specific auth method component
import { EmailPasswordAuth } from '@/components/auth/EmailPasswordAuth';

export function EmailSignIn() {
  return (
    <EmailPasswordAuth 
      onSuccess={() => console.log('Success!')} 
    />
  );
}
```

## Authentication Flow Examples

### Anonymous to Permanent Account Upgrade

```tsx
import { useAuth } from '@/components/AuthProvider';

export function UpgradePrompt() {
  const { isAnonymous, linkAccount } = useAuth();

  if (!isAnonymous) return null;

  return (
    <div className="p-4 bg-amber-50 rounded-lg">
      <p>Save your progress by creating a permanent account</p>
      <button onClick={() => linkAccount('google')}>
        Link Google Account
      </button>
    </div>
  );
}
```

### Protected Route

```tsx
import { useAuth } from '@/components/AuthProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { useState } from 'react';

export function ProtectedContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <>
        <div className="text-center p-8">
          <h2>Sign in required</h2>
          <button onClick={() => setShowAuth(true)}>
            Sign In
          </button>
        </div>
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
        />
      </>
    );
  }

  return <div>Protected content here</div>;
}
```

## Styling and Customization

All components use Tailwind CSS classes and support dark mode through `dark:` variants. The design matches the existing app aesthetic with:

- Clean, minimal interface
- Proper loading states
- Comprehensive error handling
- Accessible keyboard navigation
- Mobile-responsive design

## TypeScript Support

All components are fully typed with TypeScript interfaces:

```tsx
import type { AuthUser, AuthSession, AuthProvider, AuthMethod } from '@/components/AuthProvider';
```

## Error Handling

Components include comprehensive error handling:

- Form validation errors
- Authentication errors from Supabase
- Network connection issues
- User-friendly error messages

## Features

### ✅ Complete Authentication Methods
- Email/Password with validation
- Magic Link (passwordless)
- Google OAuth
- GitHub OAuth  
- Anonymous sessions

### ✅ User Experience
- Tabbed interface for method selection
- Anonymous user upgrade path
- Account linking capabilities
- Responsive modal design
- Loading states and error handling

### ✅ Developer Experience
- TypeScript support
- Comprehensive error handling
- Flexible component API
- Dark mode support
- Easy integration

### ✅ Security
- Proper session management
- Secure authentication flows
- Anonymous session isolation
- Account linking protection