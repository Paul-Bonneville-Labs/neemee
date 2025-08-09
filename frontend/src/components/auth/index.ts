// Main auth components
export { Auth } from '../Auth';
export { AuthModal } from './AuthModal';
export { ProfileMenu } from './ProfileMenu';
export { AuthStatus, AuthStatusBadge, ConnectionStatus } from './AuthStatus';

// OAuth sign-in component (primary authentication method)
export { OAuthSignIn } from './OAuthSignIn';

// Auth provider and types
export { AuthProvider, useAuth } from '../AuthProvider';
export type { 
  AuthError, 
  AuthState 
} from '../AuthProvider';